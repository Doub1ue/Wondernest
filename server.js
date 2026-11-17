'use strict';
/**
 * WonderNest — zero-dependency Node server
 * Accounts: parent-gated signup, username + PIN (scrypt hashed), cookie sessions.
 * Data: JSON file store at data/db.json with atomic writes.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const DATA_DIR = path.join(ROOT, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const AGE_GROUPS = ['little', 'curious', 'super'];
const CHARACTERS = ['fox', 'owl', 'bear', 'rabbit', 'panda', 'turtle'];
const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;
const MAX_BODY = 100 * 1024;

// ---------- Data store ----------
function loadDb() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const db = JSON.parse(raw);
    if (!db.users || !db.sessions) throw new Error('bad shape');
    return db;
  } catch (_) {
    return { users: {}, sessions: {} };
  }
}
let db = loadDb();
let saveTimer = null;
function saveDb() {
  // Atomic write: temp file + rename. Debounced slightly for bursts.
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      const tmp = DB_FILE + '.tmp-' + process.pid;
      fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
      fs.renameSync(tmp, DB_FILE);
    } catch (e) {
      console.error('Failed to save db:', e.message);
    }
  }, 30);
}
function saveDbNow() {
  clearTimeout(saveTimer);
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = DB_FILE + '.tmp-' + process.pid;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE);
}

// ---------- Crypto helpers ----------
function hashPin(pin, salt) {
  return crypto.scryptSync(String(pin), salt, 64).toString('hex');
}
function newSalt() { return crypto.randomBytes(16).toString('hex'); }
function newToken() { return crypto.randomBytes(32).toString('hex'); }
function safeEqual(a, b) {
  const ba = Buffer.from(a); const bb = Buffer.from(b);
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

// ---------- Grown-up gate (in-memory challenges) ----------
const gateChallenges = new Map(); // gateId -> {answer, expires}
const gateTokens = new Map(); // token -> expires
function pruneGates() {
  const now = Date.now();
  for (const [k, v] of gateChallenges) if (v.expires < now) gateChallenges.delete(k);
  for (const [k, v] of gateTokens) if (v < now) gateTokens.delete(k);
}

// ---------- Progress ----------
function defaultProgress() {
  return {
    stars: 0,
    badges: [],
    completedMissions: [],
    dailyCompletions: [], // array of YYYY-MM-DD strings
    favorites: [],
    creations: 0,
    history: [], // {type, detail, subject, at}
    subjectProgress: { math: 0, science: 0, words: 0, explore: 0, create: 0, play: 0 }
  };
}
function levelFor(stars) { return Math.floor(stars / 10) + 1; }
function decorationsFor(stars) { return Math.min(8, Math.floor(stars / 5)); }
function publicUser(user) {
  const p = user.progress;
  return {
    username: user.username,
    ageGroup: user.ageGroup,
    character: user.character,
    createdAt: user.createdAt,
    progress: p,
    level: levelFor(p.stars),
    treehouseDecorations: decorationsFor(p.stars)
  };
}
function sanitizeProgress(input, existing) {
  const p = existing || defaultProgress();
  if (!input || typeof input !== 'object') return p;
  if (Number.isFinite(input.stars)) p.stars = Math.max(0, Math.min(100000, Math.floor(input.stars)));
  if (Array.isArray(input.badges)) p.badges = [...new Set(input.badges.filter(x => typeof x === 'string').slice(0, 50))];
  if (Array.isArray(input.completedMissions)) p.completedMissions = [...new Set(input.completedMissions.filter(x => typeof x === 'string').slice(0, 100))];
  if (Array.isArray(input.dailyCompletions)) p.dailyCompletions = [...new Set(input.dailyCompletions.filter(x => typeof x === 'string').slice(0, 400))];
  if (Array.isArray(input.favorites)) p.favorites = [...new Set(input.favorites.filter(x => typeof x === 'string').slice(0, 100))];
  if (Number.isFinite(input.creations)) p.creations = Math.max(0, Math.min(100000, Math.floor(input.creations)));
  if (Array.isArray(input.history)) {
    p.history = input.history.filter(h => h && typeof h === 'object').slice(-100).map(h => ({
      type: String(h.type || 'activity').slice(0, 40),
      detail: String(h.detail || '').slice(0, 200),
      subject: String(h.subject || '').slice(0, 30),
      at: String(h.at || new Date().toISOString()).slice(0, 40)
    }));
  }
  if (input.subjectProgress && typeof input.subjectProgress === 'object') {
    for (const k of Object.keys(p.subjectProgress)) {
      if (Number.isFinite(input.subjectProgress[k])) {
        p.subjectProgress[k] = Math.max(0, Math.min(100000, Math.floor(input.subjectProgress[k])));
      }
    }
  }
  return p;
}

// ---------- HTTP helpers ----------
function sendJson(res, status, obj, extraHeaders) {
  const body = JSON.stringify(obj);
  res.writeHead(status, Object.assign({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }, extraHeaders || {}));
  res.end(body);
}
function parseCookies(req) {
  const out = {};
  const raw = req.headers.cookie || '';
  raw.split(';').forEach(part => {
    const i = part.indexOf('=');
    if (i > -1) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  });
  return out;
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', c => { size += c.length; if (size > MAX_BODY) { reject(new Error('too large')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => {
      if (!chunks.length) return resolve({});
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); } catch (_) { reject(new Error('bad json')); }
    });
    req.on('error', reject);
  });
}
function sessionUser(req) {
  const cookies = parseCookies(req);
  const token = cookies.wn_session;
  if (!token) return null;
  const sess = db.sessions[token];
  if (!sess) return null;
  // Sessions last 30 days
  if (Date.now() - sess.createdAt > 30 * 24 * 3600 * 1000) { delete db.sessions[token]; saveDb(); return null; }
  return db.users[sess.usernameKey] || null;
}
function sessionCookie(token) {
  return `wn_session=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${30 * 24 * 3600}`;
}

// ---------- API ----------
async function handleApi(req, res, url) {
  const p = url.pathname;
  pruneGates();

  if (p === '/api/gate' && req.method === 'GET') {
    const a = 4 + Math.floor(Math.random() * 9); // 4..12
    const b = 3 + Math.floor(Math.random() * 8); // 3..10
    const gateId = newToken();
    gateChallenges.set(gateId, { answer: a + b, expires: Date.now() + 5 * 60 * 1000 });
    return sendJson(res, 200, { gateId, question: `What is ${a} + ${b}?`, a, b });
  }

  if (p === '/api/gate' && req.method === 'POST') {
    let body; try { body = await readBody(req); } catch (_) { return sendJson(res, 400, { error: 'Invalid request.' }); }
    const ch = gateChallenges.get(String(body.gateId || ''));
    if (!ch || ch.expires < Date.now()) return sendJson(res, 400, { error: 'That question expired. Please try again.' });
    if (Number(body.answer) !== ch.answer) return sendJson(res, 400, { error: 'Not quite — please try again.' });
    gateChallenges.delete(String(body.gateId));
    const token = newToken();
    gateTokens.set(token, Date.now() + 10 * 60 * 1000);
    return sendJson(res, 200, { ok: true }, { 'Set-Cookie': `wn_gate=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=600` });
  }

  if (p === '/api/signup' && req.method === 'POST') {
    const cookies = parseCookies(req);
    const gateOk = cookies.wn_gate && gateTokens.has(cookies.wn_gate) && gateTokens.get(cookies.wn_gate) > Date.now();
    if (!gateOk) return sendJson(res, 403, { error: 'Please pass the grown-up check first.' });
    let body; try { body = await readBody(req); } catch (_) { return sendJson(res, 400, { error: 'Invalid request.' }); }
    const username = String(body.username || '').trim();
    const pin = String(body.pin || '');
    const ageGroup = AGE_GROUPS.includes(body.ageGroup) ? body.ageGroup : 'curious';
    const character = CHARACTERS.includes(body.character) ? body.character : 'fox';
    if (!USERNAME_RE.test(username)) return sendJson(res, 400, { error: 'Username needs 3–20 letters, numbers or underscores.' });
    if (!/^[^\s]{4,20}$/.test(pin)) return sendJson(res, 400, { error: 'PIN or password needs 4–20 characters, no spaces.' });
    const key = username.toLowerCase();
    if (db.users[key]) return sendJson(res, 409, { error: 'That username is already taken. Please choose another.' });
    const salt = newSalt();
    const user = {
      username, usernameKey: key, salt, pinHash: hashPin(pin, salt),
      ageGroup, character, createdAt: new Date().toISOString(),
      progress: defaultProgress()
    };
    db.users[key] = user;
    gateTokens.delete(cookies.wn_gate);
    const token = newToken();
    db.sessions[token] = { usernameKey: key, createdAt: Date.now() };
    saveDbNow();
    return sendJson(res, 201, { ok: true, user: publicUser(user) }, { 'Set-Cookie': sessionCookie(token) });
  }

  if (p === '/api/login' && req.method === 'POST') {
    let body; try { body = await readBody(req); } catch (_) { return sendJson(res, 400, { error: 'Invalid request.' }); }
    const username = String(body.username || '').trim();
    const pin = String(body.pin || '');
    const user = db.users[username.toLowerCase()];
    // Generic error — never reveal which part was wrong
    if (!user || !safeEqual(hashPin(pin, user.salt), user.pinHash)) {
      return sendJson(res, 401, { error: 'Username or PIN did not match. Please try again.' });
    }
    const token = newToken();
    db.sessions[token] = { usernameKey: user.usernameKey, createdAt: Date.now() };
    saveDbNow();
    return sendJson(res, 200, { ok: true, user: publicUser(user) }, { 'Set-Cookie': sessionCookie(token) });
  }

  if (p === '/api/logout' && req.method === 'POST') {
    const cookies = parseCookies(req);
    if (cookies.wn_session) { delete db.sessions[cookies.wn_session]; saveDb(); }
    return sendJson(res, 200, { ok: true }, { 'Set-Cookie': 'wn_session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0' });
  }

  if (p === '/api/me' && req.method === 'GET') {
    const user = sessionUser(req);
    if (!user) return sendJson(res, 401, { error: 'Not logged in.' });
    return sendJson(res, 200, { user: publicUser(user) });
  }

  if (p === '/api/progress' && req.method === 'GET') {
    const user = sessionUser(req);
    if (!user) return sendJson(res, 401, { error: 'Not logged in.' });
    const pub = publicUser(user);
    return sendJson(res, 200, { progress: pub.progress, level: pub.level, treehouseDecorations: pub.treehouseDecorations, ageGroup: user.ageGroup, character: user.character });
  }

  if (p === '/api/progress' && req.method === 'PUT') {
    const user = sessionUser(req);
    if (!user) return sendJson(res, 401, { error: 'Not logged in.' });
    let body; try { body = await readBody(req); } catch (_) { return sendJson(res, 400, { error: 'Invalid request.' }); }
    if (body.progress) user.progress = sanitizeProgress(body.progress, user.progress);
    if (AGE_GROUPS.includes(body.ageGroup)) user.ageGroup = body.ageGroup;
    if (CHARACTERS.includes(body.character)) user.character = body.character;
    saveDbNow();
    const pub = publicUser(user);
    return sendJson(res, 200, { ok: true, progress: pub.progress, level: pub.level, treehouseDecorations: pub.treehouseDecorations });
  }

  return sendJson(res, 404, { error: 'Not found.' });
}

// ---------- Static files ----------
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.json': 'application/json' };
function serveStatic(req, res, url) {
  let filePath = url.pathname === '/' ? path.join(PUBLIC_DIR, 'index.html') : path.join(PUBLIC_DIR, decodeURIComponent(url.pathname));
  if (!filePath.startsWith(PUBLIC_DIR)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // SPA fallback for non-file routes
      if (path.extname(filePath)) { res.writeHead(404); return res.end('Not found'); }
      return fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (e2, idx) => {
        if (e2) { res.writeHead(500); return res.end('Error'); }
        res.writeHead(200, { 'Content-Type': MIME['.html'] }); res.end(idx);
      });
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  let url;
  try { url = new URL(req.url, `http://${req.headers.host || 'localhost'}`); } catch (_) { res.writeHead(400); return res.end('Bad request'); }
  // Basic security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'same-origin');
  if (url.pathname.startsWith('/api/')) {
    try { await handleApi(req, res, url); } catch (e) { console.error(e); if (!res.headersSent) sendJson(res, 500, { error: 'Something went wrong.' }); }
  } else {
    serveStatic(req, res, url);
  }
});

server.listen(PORT, () => console.log(`WonderNest listening on port ${PORT}`));
