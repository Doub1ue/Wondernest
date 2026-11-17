'use strict';
/* WonderNest frontend — vanilla JS, no build step. */

// ---------- Mascot ----------
const NORI_SVG = `<svg class="nori-svg" viewBox="0 0 200 200" role="img" aria-label="Nori the explorer" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="105" r="62" fill="#ffb703"/>
  <circle cx="100" cy="105" r="62" fill="none" stroke="#e07b00" stroke-width="4"/>
  <path d="M38 92 Q100 20 162 92 L150 98 Q100 42 50 98 Z" fill="#6bcb77"/>
  <rect x="86" y="28" width="28" height="16" rx="6" fill="#118ab2"/>
  <circle cx="78" cy="100" r="9" fill="#22304a"/><circle cx="122" cy="100" r="9" fill="#22304a"/>
  <circle cx="81" cy="97" r="3" fill="#fff"/><circle cx="125" cy="97" r="3" fill="#fff"/>
  <path d="M82 126 Q100 142 118 126" fill="none" stroke="#22304a" stroke-width="5" stroke-linecap="round"/>
  <circle cx="56" cy="120" r="9" fill="#ffafcc"/><circle cx="144" cy="120" r="9" fill="#ffafcc"/>
  <path d="M70 160 L84 138 H116 L130 160 L116 168 H84 Z" fill="#118ab2"/>
  <circle cx="100" cy="152" r="6" fill="#fca311"/>
</svg>`;
const NORI_MINI = NORI_SVG.replace('nori-svg', 'nori-mini-svg');
document.getElementById('nori-hero').innerHTML = NORI_SVG;
document.querySelectorAll('.nori-mini').forEach(el => { el.innerHTML = NORI_MINI; });

// ---------- Content data ----------
const AGE_LABELS = { little: 'Little Explorers (3–5)', curious: 'Curious Kids (6–8)', super: 'Super Thinkers (9–11)' };
const CHARACTERS = { fox: '🦊', owl: '🦉', bear: '🐻', rabbit: '🐰', panda: '🐼', turtle: '🐢' };

const QUIZZES = {
  little: [
    { q: 'How many apples? 🍎🍎🍎', choices: ['2', '3', '5'], answer: '3', fact: 'You counted 3 apples. Great counting!', subject: 'math' },
    { q: 'What color is the sky on a sunny day?', choices: ['Blue', 'Green', 'Purple'], answer: 'Blue', fact: 'The sky looks blue because of how sunlight bounces in the air!', subject: 'science' },
    { q: 'Which animal says "moo"?', choices: ['Cat', 'Cow', 'Duck'], answer: 'Cow', fact: 'Cows say moo. Cats say meow!', subject: 'science' },
    { q: 'What shape has 3 sides?', choices: ['Square', 'Circle', 'Triangle'], answer: 'Triangle', fact: 'A triangle has 3 sides and 3 corners.', subject: 'math' },
    { q: 'Which word rhymes with "cat"?', choices: ['Hat', 'Dog', 'Sun'], answer: 'Hat', fact: 'Cat and hat rhyme — they end with the same sound!', subject: 'words' },
    { q: 'How many legs does a dog have?', choices: ['2', '4', '6'], answer: '4', fact: 'Dogs walk on 4 legs.', subject: 'science' }
  ],
  curious: [
    { q: 'What is 7 + 5?', choices: ['11', '12', '13'], answer: '12', fact: '7 + 5 = 12. Try counting on from 7!', subject: 'math' },
    { q: 'Which planet do we live on?', choices: ['Mars', 'Earth', 'Venus'], answer: 'Earth', fact: 'Earth is the only planet known to have life.', subject: 'science' },
    { q: 'What is the past tense of "run"?', choices: ['Runned', 'Ran', 'Running'], answer: 'Ran', fact: '"I ran to the park" — ran is the past tense of run.', subject: 'words' },
    { q: 'What is half of 20?', choices: ['5', '10', '15'], answer: '10', fact: 'Half of 20 is 10, because 10 + 10 = 20.', subject: 'math' },
    { q: 'Which of these can fly?', choices: ['Penguin', 'Ostrich', 'Robin'], answer: 'Robin', fact: 'Robins fly. Penguins swim and ostriches run!', subject: 'science' },
    { q: 'Which word means the opposite of "hot"?', choices: ['Warm', 'Cold', 'Big'], answer: 'Cold', fact: 'Hot and cold are opposites, called antonyms.', subject: 'words' }
  ],
  super: [
    { q: 'What is 12 × 4?', choices: ['36', '48', '52'], answer: '48', fact: '12 × 4 = 48. That is 4 groups of 12.', subject: 'math' },
    { q: 'Which gas do plants take in from the air?', choices: ['Oxygen', 'Carbon dioxide', 'Helium'], answer: 'Carbon dioxide', fact: 'Plants use carbon dioxide and sunlight to make food.', subject: 'science' },
    { q: 'Which sentence uses a simile?', choices: ['The cat slept.', 'She ran like the wind.', 'It rained today.'], answer: 'She ran like the wind.', fact: 'A simile compares two things using "like" or "as".', subject: 'words' },
    { q: 'What is the next prime number after 7?', choices: ['9', '10', '11'], answer: '11', fact: '11 is prime — it can only be divided by 1 and itself.', subject: 'math' },
    { q: 'Which is the largest ocean on Earth?', choices: ['Atlantic', 'Indian', 'Pacific'], answer: 'Pacific', fact: 'The Pacific Ocean covers about a third of Earth\'s surface!', subject: 'science' },
    { q: 'If a story is told by "I" and "me", it is in…', choices: ['First person', 'Third person', 'No person'], answer: 'First person', fact: 'First-person stories are told by a character inside the story.', subject: 'words' }
  ]
};

const EXPLORE_TOPICS = [
  { id: 'space', emoji: '🪐', title: 'Space', facts: { little: 'The Moon is Earth\'s night light. It changes shape in the sky!', curious: 'Saturn has rings made of ice and rock. Some pieces are as small as grains of sand!', super: 'A day on Venus is longer than a year on Venus — it spins incredibly slowly.' } },
  { id: 'dinos', emoji: '🦕', title: 'Dinosaurs', facts: { little: 'Some dinosaurs were as small as chickens!', curious: 'The word dinosaur means "terrible lizard" — but many were gentle plant-eaters.', super: 'Birds are living dinosaurs! They evolved from small feathered theropods.' } },
  { id: 'oceans', emoji: '🐙', title: 'Oceans', facts: { little: 'An octopus has three hearts!', curious: 'The blue whale is the biggest animal that has ever lived — bigger than any dinosaur.', super: 'More of the Moon\'s surface has been mapped than the deep ocean floor.' } },
  { id: 'animals', emoji: '🦁', title: 'Animals', facts: { little: 'A baby frog is called a tadpole.', curious: 'Elephants "talk" through rumbles so low we can barely hear them.', super: 'A group of flamingos is called a flamboyance — and they are born grey, not pink!' } },
  { id: 'inventions', emoji: '💡', title: 'Inventions', facts: { little: 'The first teddy bears were made over 100 years ago!', curious: 'The bicycle was invented before the car — and early ones had a giant front wheel!', super: 'The first computer programmer was Ada Lovelace, in the 1840s — before computers existed!' } },
  { id: 'places', emoji: '🗺️', title: 'Amazing Places', facts: { little: 'There is a mountain so tall its top is in the clouds — Mount Everest!', curious: 'The Great Wall of China is the longest wall in the world.', super: 'The Sahara is almost as big as the whole United States — and it used to be green and full of lakes.' } }
];

const DAILY = {
  little: ['Count 5 round things in your home.', 'Find something blue and draw it.', 'Make the sound of 3 different animals.', 'Build the tallest tower you can with blocks or pillows.', 'Point to everything that starts with the "B" sound.'],
  curious: ['Write down 3 new words and what they mean.', 'Measure your table using your hand spans.', 'Draw a map of your street or home.', 'Find 5 different leaves or rocks outside.', 'Read a story and tell someone the ending you would change.'],
  super: ['Invent a gadget that solves a small problem — sketch it!', 'Learn the capitals of 5 countries and quiz a friend.', 'Write the first paragraph of a mystery story.', 'Estimate, then count, the windows in your home.', 'Design a board game rule that makes a game fairer.']
};

const MISSIONS = [
  { id: 'leaves', emoji: '🍂', text: 'Find three different leaves.' },
  { id: 'red', emoji: '🔴', text: 'Count how many red objects you can find.' },
  { id: 'planet', emoji: '🪐', text: 'Draw an imaginary planet.' },
  { id: 'word', emoji: '📖', text: 'Learn one new word and use it in a sentence.' },
  { id: 'build', emoji: '🧱', text: 'Build something using household objects.' },
  { id: 'moon', emoji: '🌙', text: 'Look at the moon and describe what you see.' },
  { id: 'texture', emoji: '🪨', text: 'Find something in nature with an interesting texture.' },
  { id: 'animalwatch', emoji: '🐦', text: 'Observe an animal and describe what it does.' }
];

const DECORATIONS = ['⭐ Star Lantern', '🎈 Balloon Bunch', '📚 Story Bookshelf', '🪴 Happy Plant', '🦋 Butterfly Mobile', '🏮 Cozy Lantern', '🎨 Art Wall', '🔭 Telescope Corner'];

const BADGE_DEFS = [
  { id: 'first-star', label: '🌟 First Star', test: p => p.stars >= 1 },
  { id: 'star-10', label: '✨ Star Collector (10)', test: p => p.stars >= 10 },
  { id: 'star-25', label: '💫 Wonder Star (25)', test: p => p.stars >= 25 },
  { id: 'first-mission', label: '🌿 First Mission', test: p => p.completedMissions.length >= 1 },
  { id: 'mission-3', label: '🧭 Mission Explorer (3)', test: p => p.completedMissions.length >= 3 },
  { id: 'creator', label: '🎨 Little Creator', test: p => p.creations >= 1 },
  { id: 'daily', label: '🗓️ Daily Adventurer', test: p => p.dailyCompletions.length >= 1 },
  { id: 'memory', label: '🃏 Memory Master', test: p => (p.subjectProgress.play || 0) >= 1 }
];

const STORY = {
  start: { text: 'Nori found a tiny lost star twinkling in the grass. "I need to get home to the sky!" it whispered. How should Nori help?', choices: [{ label: '🚀 Build a tiny rocket', next: 'rocket' }, { label: '🦉 Ask the wise owl', next: 'owl' }] },
  rocket: { text: 'The rocket is ready, but it needs fuel. What should power it?', choices: [{ label: '🌈 Rainbow bubbles', next: 'end1' }, { label: '🎈 A hundred balloons', next: 'end2' }] },
  owl: { text: 'The owl hoots: "Stars return home when someone makes a kind wish." What wish should Nori make?', choices: [{ label: '💛 A wish for a friend', next: 'end3' }, { label: '🌍 A wish for the whole world', next: 'end4' }] },
  end1: { text: 'The rainbow bubbles lifted the star gently home. It twinkles extra bright whenever Nori looks up. The End! 🌟', choices: [] },
  end2: { text: 'Pop! Pop! The balloons danced the star all the way to the sky. The End! 🌟', choices: [] },
  end3: { text: 'Nori wished for a friend — and the star became the brightest in the sky, watching over everyone. The End! 🌟', choices: [] },
  end4: { text: 'The kind wish sparkled around the world, and the star floated home, glowing with happiness. The End! 🌟', choices: [] }
};

// ---------- State ----------
let state = {
  user: null, // {username, ageGroup, character, progress, level, treehouseDecorations}
  ageGroup: 'curious',
  guestProgress: freshProgress()
};
function freshProgress() {
  return { stars: 0, badges: [], completedMissions: [], dailyCompletions: [], favorites: [], creations: 0, history: [], subjectProgress: { math: 0, science: 0, words: 0, explore: 0, create: 0, play: 0 } };
}
function progress() { return state.user ? state.user.progress : state.guestProgress; }
function level() { return Math.floor(progress().stars / 10) + 1; }
function decorations() { return Math.min(8, Math.floor(progress().stars / 5)); }
function todayStr() { return new Date().toISOString().slice(0, 10); }

let saveTimer = null;
async function saveProgress(extra) {
  if (!state.user) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try {
      await fetch('/api/progress', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ progress: state.user.progress }, extra || {})) });
    } catch (_) { /* offline — progress stays in memory for this visit */ }
  }, 250);
}
function logHistory(type, detail, subject) {
  progress().history.push({ type, detail, subject: subject || '', at: new Date().toISOString() });
  if (progress().history.length > 100) progress().history = progress().history.slice(-100);
}
function checkBadges() {
  const p = progress();
  BADGE_DEFS.forEach(b => { if (b.test(p) && !p.badges.includes(b.id)) { p.badges.push(b.id); toast(`New badge: ${b.label}!`); } });
}
function earnStars(n, detail, subject) {
  const before = decorations();
  progress().stars += n;
  if (subject && progress().subjectProgress[subject] !== undefined) progress().subjectProgress[subject] += 1;
  logHistory('stars', detail || `Earned ${n} star(s)`, subject);
  checkBadges();
  if (decorations() > before) toast(`🌳 Your Treehouse grew: ${DECORATIONS[decorations() - 1]} unlocked!`);
  saveProgress();
  renderAccountBar(); renderTreehouse(); renderAdventure();
}

// ---------- Toast ----------
let toastTimer = null;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}
function speak(text) {
  try { const u = new SpeechSynthesisUtterance(text); u.rate = 0.95; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (_) {}
}

// ---------- Navigation ----------
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + name).classList.add('active');
  document.querySelectorAll('.navbtn').forEach(b => b.classList.toggle('active', b.dataset.view === name));
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (name === 'adventure') renderAdventure();
  if (name === 'parents') renderParentProgress();
}
document.querySelectorAll('.navbtn').forEach(b => b.addEventListener('click', () => showView(b.dataset.view)));
document.querySelectorAll('[data-goto]').forEach(b => b.addEventListener('click', () => showView(b.dataset.goto)));

// ---------- Accessibility ----------
function bindToggle(id, cls) {
  const btn = document.getElementById(id);
  btn.addEventListener('click', () => {
    const on = document.body.classList.toggle(cls);
    btn.setAttribute('aria-pressed', String(on));
  });
}
bindToggle('btn-textsize', 'large-text');
bindToggle('btn-contrast', 'high-contrast');
bindToggle('btn-calm', 'calm');

// ---------- Age picker ----------
function setAge(age, silent) {
  state.ageGroup = age;
  document.querySelectorAll('.agebtn').forEach(b => b.classList.toggle('selected', b.dataset.age === age));
  renderQuiz(); renderExplore(); renderDaily(); renderPattern();
  if (state.user && state.user.ageGroup !== age) { state.user.ageGroup = age; saveProgress({ ageGroup: age }); }
  if (!silent) toast(`Age group: ${AGE_LABELS[age]}`);
}
document.querySelectorAll('.agebtn').forEach(b => b.addEventListener('click', () => setAge(b.dataset.age)));

// ---------- Account bar & auth ----------
function renderAccountBar() {
  const bar = document.getElementById('account-bar');
  if (state.user) {
    bar.innerHTML = `<span>${CHARACTERS[state.user.character] || '🦊'} ${escapeHtml(state.user.username)}</span>
      <span class="star-pill">⭐ ${progress().stars} • Level ${level()}</span>
      <button class="chip" id="btn-logout">Log out</button>`;
    document.getElementById('btn-logout').addEventListener('click', logout);
  } else {
    bar.innerHTML = `<span class="star-pill">⭐ ${progress().stars} (guest)</span>`;
  }
  renderAuthPanel();
}
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

function renderAuthPanel() {
  const panel = document.getElementById('auth-panel');
  if (state.user) {
    panel.innerHTML = `<div class="card"><strong>Welcome back, ${escapeHtml(state.user.username)}!</strong>
      <p class="muted">Your stars, badges, missions and treehouse are saved to your account and will be here when you log in again.</p></div>`;
    return;
  }
  panel.innerHTML = `<div class="card">
    <h3>🔐 Explorers, log in!</h3>
    <label for="login-username">Username</label>
    <input id="login-username" autocomplete="username" maxlength="20">
    <label for="login-pin">PIN or password</label>
    <input id="login-pin" type="password" autocomplete="current-password" maxlength="20">
    <p class="auth-msg" id="login-msg"></p>
    <button class="bigbtn primary" id="btn-login" style="width:100%">Log In</button>
    <hr>
    <h3>🌱 New to WonderNest?</h3>
    <p class="muted">Grown-ups: create a free account for your child — just a username and a PIN. No email, no real name.</p>
    <div id="signup-flow"><button class="bigbtn secondary" id="btn-start-signup" style="width:100%">👨‍👩‍👧 Grown-Ups: Create an Account</button></div>
  </div>`;
  document.getElementById('btn-login').addEventListener('click', login);
  document.getElementById('btn-start-signup').addEventListener('click', startSignupGate);
}

async function login() {
  const username = document.getElementById('login-username').value.trim();
  const pin = document.getElementById('login-pin').value;
  const msg = document.getElementById('login-msg');
  try {
    const r = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, pin }) });
    const data = await r.json();
    if (!r.ok) { msg.textContent = data.error || 'Login failed.'; return; }
    state.user = data.user;
    setAge(state.user.ageGroup, true);
    toast(`Welcome back, ${state.user.username}! Your progress is restored.`);
    renderAll();
  } catch (_) { msg.textContent = 'Could not reach the server. Please try again.'; }
}
async function logout() {
  try { await fetch('/api/logout', { method: 'POST' }); } catch (_) {}
  state.user = null; state.guestProgress = freshProgress();
  toast('Logged out. See you soon, explorer!');
  renderAll();
}

// Signup flow: grown-up gate -> details form
let gateId = null;
async function startSignupGate() {
  const flow = document.getElementById('signup-flow');
  try {
    const r = await fetch('/api/gate'); const data = await r.json();
    gateId = data.gateId;
    flow.innerHTML = `<p><strong>Grown-up check:</strong> ${escapeHtml(data.question)}</p>
      <label for="gate-answer">Your answer</label>
      <input id="gate-answer" inputmode="numeric" maxlength="4">
      <p class="auth-msg" id="gate-msg"></p>
      <button class="bigbtn primary" id="btn-gate" style="width:100%">Continue</button>`;
    document.getElementById('btn-gate').addEventListener('click', submitGate);
  } catch (_) { flow.innerHTML = '<p class="auth-msg">Could not load the grown-up check. Please try again.</p>'; }
}
async function submitGate() {
  const answer = document.getElementById('gate-answer').value;
  const msg = document.getElementById('gate-msg');
  try {
    const r = await fetch('/api/gate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ gateId, answer: Number(answer) }) });
    const data = await r.json();
    if (!r.ok) { msg.textContent = data.error || 'Please try again.'; return; }
    showSignupForm();
  } catch (_) { msg.textContent = 'Could not reach the server.'; }
}
let signupCharacter = 'fox';
function showSignupForm() {
  const flow = document.getElementById('signup-flow');
  flow.innerHTML = `<label for="su-username">Child's username (letters &amp; numbers)</label>
    <input id="su-username" maxlength="20" autocomplete="off">
    <label for="su-pin">PIN or password (4+ characters)</label>
    <input id="su-pin" type="password" maxlength="20" autocomplete="new-password">
    <label for="su-age">Age group</label>
    <select id="su-age"><option value="little">Little Explorers (3–5)</option><option value="curious" selected>Curious Kids (6–8)</option><option value="super">Super Thinkers (9–11)</option></select>
    <label>Explorer character</label>
    <div class="char-row">${Object.entries(CHARACTERS).map(([k, e]) => `<button type="button" class="charbtn${k === 'fox' ? ' selected' : ''}" data-char="${k}" aria-label="${k}">${e}</button>`).join('')}</div>
    <p class="auth-msg" id="su-msg"></p>
    <button class="bigbtn primary" id="btn-signup" style="width:100%">Create Account</button>`;
  signupCharacter = 'fox';
  flow.querySelectorAll('.charbtn').forEach(b => b.addEventListener('click', () => {
    signupCharacter = b.dataset.char;
    flow.querySelectorAll('.charbtn').forEach(x => x.classList.toggle('selected', x === b));
  }));
  document.getElementById('btn-signup').addEventListener('click', signup);
}
async function signup() {
  const username = document.getElementById('su-username').value.trim();
  const pin = document.getElementById('su-pin').value;
  const ageGroup = document.getElementById('su-age').value;
  const msg = document.getElementById('su-msg');
  try {
    const r = await fetch('/api/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, pin, ageGroup, character: signupCharacter }) });
    const data = await r.json();
    if (!r.ok) { msg.textContent = data.error || 'Could not create the account.'; return; }
    state.user = data.user;
    setAge(ageGroup, true);
    toast(`Account created! Welcome to WonderNest, ${username}!`);
    renderAll();
  } catch (_) { msg.textContent = 'Could not reach the server.'; }
}

// ---------- Learn: quiz ----------
let quizIndex = 0, quizAnswered = false;
function renderQuiz() {
  const bank = QUIZZES[state.ageGroup];
  const item = bank[quizIndex % bank.length];
  quizAnswered = false;
  const card = document.getElementById('quiz-card');
  card.innerHTML = `<div class="quiz-q">${escapeHtml(item.q)}</div>
    <div class="quiz-choices">${item.choices.map(c => `<button class="quiz-choice">${escapeHtml(c)}</button>`).join('')}</div>
    <div class="quiz-fact hidden" id="quiz-fact"></div>
    <div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap">
      <button class="chip" id="quiz-listen">🔊 Hear the question</button>
      <button class="chip hidden" id="quiz-next">Next Question ➜</button>
    </div>`;
  document.getElementById('quiz-listen').addEventListener('click', () => speak(item.q));
  document.getElementById('quiz-next').addEventListener('click', () => { quizIndex++; renderQuiz(); });
  card.querySelectorAll('.quiz-choice').forEach(btn => btn.addEventListener('click', () => {
    if (quizAnswered) return;
    quizAnswered = true;
    const fact = document.getElementById('quiz-fact');
    if (btn.textContent === item.answer) {
      btn.classList.add('correct');
      fact.textContent = `⭐ Correct! ${item.fact}`;
      document.getElementById('learn-nori-text').textContent = 'Great job, explorer! Nori is proud of you.';
      earnStars(2, `Quiz correct: ${item.q}`, item.subject);
    } else {
      btn.classList.add('wrong');
      card.querySelectorAll('.quiz-choice').forEach(b => { if (b.textContent === item.answer) b.classList.add('correct'); });
      fact.textContent = `Good try! The answer is ${item.answer}. ${item.fact}`;
      document.getElementById('learn-nori-text').textContent = 'Good trying! Learning takes practice.';
    }
    fact.classList.remove('hidden');
    document.getElementById('quiz-next').classList.remove('hidden');
  }));
}

// ---------- Explore ----------
let storyNode = 'start', storyDone = false;
function renderExplore() {
  const grid = document.getElementById('explore-grid');
  grid.innerHTML = EXPLORE_TOPICS.map(t => `<button class="explore-card" data-topic="${t.id}"><span>${t.emoji}</span><strong>${t.title}</strong><br><small>Tap for a wow fact</small></button>`).join('') + '<div class="explore-fact hidden" id="explore-fact"></div>';
  grid.querySelectorAll('.explore-card').forEach(btn => btn.addEventListener('click', () => {
    const t = EXPLORE_TOPICS.find(x => x.id === btn.dataset.topic);
    const fact = document.getElementById('explore-fact');
    fact.textContent = `${t.emoji} ${t.title}: ${t.facts[state.ageGroup]}`;
    fact.classList.remove('hidden');
    if (!progress().favorites.includes(t.id)) {
      progress().favorites.push(t.id);
      earnStars(1, `Discovered: ${t.title}`, 'explore');
    }
  }));
  renderStory();
}
function renderStory() {
  const el = document.getElementById('story-quest');
  const node = STORY[storyNode];
  el.innerHTML = `<p style="font-size:1.1rem">${escapeHtml(node.text)}</p>` +
    node.choices.map((c, i) => `<button class="story-choice" data-next="${c.next}">${escapeHtml(c.label)}</button>`).join('') +
    (node.choices.length === 0 ? '<button class="chip" id="story-restart">↩ Read Again</button>' : '');
  el.querySelectorAll('.story-choice').forEach(b => b.addEventListener('click', () => {
    storyNode = b.dataset.next;
    if (STORY[storyNode].choices.length === 0 && !storyDone) { storyDone = true; earnStars(3, 'Finished the Story Quest', 'words'); }
    renderStory();
  }));
  const restart = document.getElementById('story-restart');
  if (restart) restart.addEventListener('click', () => { storyNode = 'start'; renderStory(); });
}

// ---------- Today's Adventure ----------
function renderDaily() {
  const list = DAILY[state.ageGroup];
  const idx = Math.floor(Date.now() / 86400000) % list.length;
  const done = progress().dailyCompletions.includes(todayStr());
  document.getElementById('daily-adventure').innerHTML = `<p style="font-size:1.2rem;font-weight:700">${escapeHtml(list[idx])}</p>
    ${done ? '<p class="status">✅ Done today — bonus stars earned! Come back tomorrow for a new adventure.</p>' : '<button class="bigbtn primary" id="daily-done">I Did It! (+5 ⭐)</button>'}`;
  const btn = document.getElementById('daily-done');
  if (btn) btn.addEventListener('click', () => {
    progress().dailyCompletions.push(todayStr());
    earnStars(5, "Completed Today's Adventure", 'explore');
    renderDaily(); renderAdventure();
  });
}

// ---------- Wonder Missions ----------
function renderMissions() {
  const el = document.getElementById('missions-list');
  el.innerHTML = MISSIONS.map(m => {
    const done = progress().completedMissions.includes(m.id);
    return `<div class="mission${done ? ' done' : ''}"><div style="font-size:1.6rem">${m.emoji}</div><strong>${escapeHtml(m.text)}</strong><br>
      ${done ? '<span class="status">✅ Completed</span>' : `<button class="chip" data-mission="${m.id}">I Did This!</button>`}</div>`;
  }).join('');
  el.querySelectorAll('[data-mission]').forEach(b => b.addEventListener('click', () => {
    progress().completedMissions.push(b.dataset.mission);
    earnStars(3, 'Completed a Wonder Mission', 'explore');
    toast('🌿 Wonder Mission complete! Great exploring in the real world.');
    renderMissions(); renderAdventure();
  }));
}

// ---------- Treehouse ----------
function renderTreehouse() {
  const n = decorations();
  document.getElementById('treehouse').innerHTML = `<span class="tree-label">🌳 Your treehouse has ${n} of ${DECORATIONS.length} decorations (⭐ ${progress().stars})</span>` +
    DECORATIONS.map((d, i) => `<span class="${i < n ? '' : 'locked'}" title="${escapeHtml(d)}">${['⭐', '🎈', '📚', '🪴', '🦋', '🏮', '🎨', '🔭'][i]}</span>`).join('');
}

// ---------- Create: drawing pad ----------
(function initDrawing() {
  const canvas = document.getElementById('draw-canvas');
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  let drawing = false, color = '#ff6b6b';
  const colors = ['#ff6b6b', '#fca311', '#ffd93d', '#6bcb77', '#118ab2', '#9b5de5', '#f15bb5', '#22304a'];
  const wrap = document.getElementById('draw-colors');
  wrap.innerHTML = colors.map((c, i) => `<button class="swatch${i === 0 ? ' selected' : ''}" data-color="${c}" style="background:${c}" aria-label="Color ${c}"></button>`).join('');
  wrap.querySelectorAll('.swatch').forEach(s => s.addEventListener('click', () => {
    color = s.dataset.color;
    wrap.querySelectorAll('.swatch').forEach(x => x.classList.toggle('selected', x === s));
  }));
  function pos(e) {
    const r = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return { x: (src.clientX - r.left) * (canvas.width / r.width), y: (src.clientY - r.top) * (canvas.height / r.height) };
  }
  function start(e) { drawing = true; const p = pos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); e.preventDefault(); }
  function move(e) { if (!drawing) return; const p = pos(e); ctx.strokeStyle = color; ctx.lineWidth = Number(document.getElementById('brush-size').value); ctx.lineTo(p.x, p.y); ctx.stroke(); e.preventDefault(); }
  function stop() { drawing = false; }
  canvas.addEventListener('mousedown', start); canvas.addEventListener('mousemove', move);
  window.addEventListener('mouseup', stop);
  canvas.addEventListener('touchstart', start, { passive: false }); canvas.addEventListener('touchmove', move, { passive: false }); canvas.addEventListener('touchend', stop);
  document.getElementById('draw-clear').addEventListener('click', () => { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height); });
  document.getElementById('draw-save').addEventListener('click', () => {
    const a = document.createElement('a');
    a.download = 'my-wondernest-drawing.png'; a.href = canvas.toDataURL('image/png'); a.click();
    progress().creations += 1;
    earnStars(1, 'Saved a drawing', 'create');
    toast('🎨 Drawing saved! +1 ⭐');
  });
})();

// ---------- Create: music pads ----------
(function initMusic() {
  const notes = [262, 294, 330, 349, 392, 440, 494, 523];
  const colors = ['#ff6b6b', '#fca311', '#ffd93d', '#6bcb77', '#118ab2', '#9b5de5', '#f15bb5', '#06d6a0'];
  const labels = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Ti', 'Do'];
  const wrap = document.getElementById('music-pads');
  wrap.innerHTML = notes.map((n, i) => `<button class="pad" data-freq="${n}" style="background:${colors[i]}">${labels[i]}<br>🎵</button>`).join('');
  let audioCtx = null;
  wrap.querySelectorAll('.pad').forEach(p => p.addEventListener('click', () => {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
      osc.frequency.value = Number(p.dataset.freq); osc.type = 'sine';
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.7);
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.start(); osc.stop(audioCtx.currentTime + 0.7);
    } catch (_) {}
  }));
})();

// ---------- Play: Memory Match ----------
const MEM_EMOJIS = ['🦁', '🐙', '🚀', '🍓', '🌈', '🦋'];
let memFlipped = [], memMatched = 0, memLock = false;
function renderMemory() {
  const deck = [...MEM_EMOJIS, ...MEM_EMOJIS].map((e, i) => ({ e, k: i })).sort(() => Math.random() - 0.5);
  memFlipped = []; memMatched = 0; memLock = false;
  const board = document.getElementById('memory-board');
  document.getElementById('memory-status').textContent = '';
  board.innerHTML = deck.map((c, i) => `<button class="memcard" data-i="${i}" data-e="${c.e}" aria-label="Memory card">?</button>`).join('');
  board.querySelectorAll('.memcard').forEach(card => card.addEventListener('click', () => {
    if (memLock || card.classList.contains('face') || card.classList.contains('matched')) return;
    card.classList.add('face'); card.textContent = card.dataset.e;
    memFlipped.push(card);
    if (memFlipped.length === 2) {
      memLock = true;
      const [a, b] = memFlipped;
      if (a.dataset.e === b.dataset.e) {
        a.classList.add('matched'); b.classList.add('matched');
        memMatched++; memFlipped = []; memLock = false;
        if (memMatched === MEM_EMOJIS.length) {
          document.getElementById('memory-status').textContent = '🎉 You found every pair!';
          earnStars(4, 'Won Memory Match', 'play');
        }
      } else {
        setTimeout(() => { a.classList.remove('face'); b.classList.remove('face'); a.textContent = '?'; b.textContent = '?'; memFlipped = []; memLock = false; }, 800);
      }
    }
  }));
}
document.getElementById('memory-restart').addEventListener('click', renderMemory);

// ---------- Play: Pattern Detective ----------
const PATTERNS = [
  { seq: ['🔴', '🔵', '🔴', '🔵', '🔴'], answer: '🔵', choices: ['🔵', '🟢', '🔴'] },
  { seq: ['⭐', '⭐', '🌙', '⭐', '⭐'], answer: '🌙', choices: ['⭐', '🌙', '☀️'] },
  { seq: ['🐶', '🐱', '🐶', '🐱', '🐶'], answer: '🐱', choices: ['🐶', '🐱', '🐰'] },
  { seq: ['🍎', '🍌', '🍎', '🍌', '🍎'], answer: '🍌', choices: ['🍇', '🍎', '🍌'] },
  { seq: ['1️⃣', '2️⃣', '3️⃣', '4️⃣'], answer: '5️⃣', choices: ['5️⃣', '6️⃣', '🔟'] }
];
let patternIdx = 0;
function renderPattern() {
  const p = PATTERNS[patternIdx % PATTERNS.length];
  const el = document.getElementById('pattern-game');
  el.innerHTML = `<div class="pattern-seq">${p.seq.join(' ')} ❓</div>
    <div class="pattern-choices">${p.choices.map(c => `<button class="pattern-choice">${c}</button>`).join('')}</div>
    <p class="status" id="pattern-status"></p>`;
  el.querySelectorAll('.pattern-choice').forEach(b => b.addEventListener('click', () => {
    const st = document.getElementById('pattern-status');
    if (b.textContent === p.answer) {
      st.textContent = '🎉 Correct, detective! +2 ⭐';
      earnStars(2, 'Solved a pattern', 'play');
      patternIdx++;
      setTimeout(renderPattern, 1200);
    } else { st.textContent = 'Not quite — look at the pattern again!'; }
  }));
}

// ---------- My Adventure ----------
function renderAdventure() {
  const el = document.getElementById('adventure-content');
  const p = progress();
  if (!state.user) {
    el.innerHTML = `<div class="card"><p><strong>You're exploring as a guest.</strong></p>
      <p class="muted">Ask a grown-up to create your free account on the Home page so your stars, badges and treehouse are saved and waiting for you next time!</p></div>`;
    return;
  }
  const badges = BADGE_DEFS.map(b => `<span class="badge${p.badges.includes(b.id) ? '' : ' locked'}">${b.label}</span>`).join('');
  const subjects = Object.entries(p.subjectProgress).map(([k, v]) => `<div class="stat"><strong>${v}</strong>${k[0].toUpperCase() + k.slice(1)}</div>`).join('');
  const history = p.history.slice(-12).reverse().map(h => `<li>${escapeHtml(h.detail)} <small class="muted">(${new Date(h.at).toLocaleDateString()})</small></li>`).join('') || '<li>No adventures yet — go explore!</li>';
  const chars = Object.entries(CHARACTERS).map(([k, e]) => `<button class="charbtn${state.user.character === k ? ' selected' : ''}" data-setchar="${k}" aria-label="${k}">${e}</button>`).join('');
  el.innerHTML = `<div class="card">
      <h3>${CHARACTERS[state.user.character]} ${escapeHtml(state.user.username)} — Level ${level()} Explorer</h3>
      <div class="stat-row">
        <div class="stat"><strong>⭐ ${p.stars}</strong>Stars</div>
        <div class="stat"><strong>${p.badges.length}</strong>Badges</div>
        <div class="stat"><strong>${p.completedMissions.length}</strong>Missions</div>
        <div class="stat"><strong>${p.creations}</strong>Creations</div>
        <div class="stat"><strong>🌳 ${decorations()}/8</strong>Treehouse</div>
      </div>
      <h4>My explorer character</h4><div class="char-row">${chars}</div>
      <h4>Badges</h4><div class="badge-row">${badges}</div>
      <h4>Progress by subject</h4><div class="stat-row">${subjects}</div>
      <h4>Recent adventures</h4><ul class="history-list">${history}</ul>
    </div>`;
  el.querySelectorAll('[data-setchar]').forEach(b => b.addEventListener('click', () => {
    state.user.character = b.dataset.setchar;
    saveProgress({ character: state.user.character });
    renderAccountBar(); renderAdventure();
    toast('Explorer character updated!');
  }));
}

// ---------- Parent Zone ----------
let parentGateId = null;
function renderParentGate() {
  const el = document.getElementById('parent-gate');
  el.innerHTML = `<div class="card"><p><strong>Grown-ups only.</strong> Please answer a quick math question to enter the Parent Zone.</p>
    <div id="pg-question"><button class="bigbtn secondary" id="pg-start">Start Grown-Up Check</button></div></div>`;
  document.getElementById('pg-start').addEventListener('click', async () => {
    try {
      const r = await fetch('/api/gate'); const d = await r.json();
      parentGateId = d.gateId;
      document.getElementById('pg-question').innerHTML = `<label for="pg-answer"><strong>${escapeHtml(d.question)}</strong></label>
        <input id="pg-answer" inputmode="numeric" style="padding:12px;border:2px solid #c9d4e8;border-radius:14px;font-size:1.05rem;min-height:50px;width:100%;margin:8px 0">
        <p class="auth-msg" id="pg-msg"></p>
        <button class="bigbtn primary" id="pg-submit">Enter Parent Zone</button>`;
      document.getElementById('pg-submit').addEventListener('click', async () => {
        const ans = document.getElementById('pg-answer').value;
        const rr = await fetch('/api/gate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ gateId: parentGateId, answer: Number(ans) }) });
        const dd = await rr.json();
        if (!rr.ok) { document.getElementById('pg-msg').textContent = dd.error || 'Try again.'; return; }
        document.getElementById('parent-gate').innerHTML = '';
        document.getElementById('parent-content').hidden = false;
        renderParentProgress();
      });
    } catch (_) {}
  });
}
function renderParentProgress() {
  const el = document.getElementById('parent-progress');
  if (!el || document.getElementById('parent-content').hidden) return;
  if (!state.user) {
    el.innerHTML = `<h3>📊 Your child's progress</h3><p class="muted">No child is logged in right now. Log in on the Home page to see live progress here — activities completed, topics explored, achievements, and recommendations.</p>`;
    return;
  }
  const p = progress();
  const subjects = Object.entries(p.subjectProgress).map(([k, v]) => `<div class="stat"><strong>${v}</strong>${k[0].toUpperCase() + k.slice(1)} activities</div>`).join('');
  const recent = p.history.slice(-6).reverse().map(h => `<li>${escapeHtml(h.detail)} <small class="muted">(${new Date(h.at).toLocaleString()})</small></li>`).join('') || '<li>No activity yet.</li>';
  const weakest = Object.entries(p.subjectProgress).sort((a, b) => a[1] - b[1])[0];
  el.innerHTML = `<h3>📊 ${escapeHtml(state.user.username)}'s progress</h3>
    <div class="stat-row"><div class="stat"><strong>⭐ ${p.stars}</strong>Stars</div><div class="stat"><strong>Level ${level()}</strong>Adventure level</div><div class="stat"><strong>${p.badges.length}</strong>Badges</div><div class="stat"><strong>${p.completedMissions.length}</strong>Missions done</div></div>
    <h4>Progress by subject</h4><div class="stat-row">${subjects}</div>
    <h4>Recent activity</h4><ul class="history-list">${recent}</ul>
    <h4>Recommendation</h4><p>Your child has explored <strong>${weakest[0]}</strong> the least so far — a great next adventure together! Wonder Missions are also a lovely screen-free option.</p>`;
}

// ---------- Render all / boot ----------
function renderAll() {
  renderAccountBar(); renderDaily(); renderMissions(); renderTreehouse(); renderAdventure(); renderParentProgress();
}
(async function boot() {
  try {
    const r = await fetch('/api/me');
    if (r.ok) { const d = await r.json(); state.user = d.user; state.ageGroup = state.user.ageGroup; }
  } catch (_) {}
  setAge(state.ageGroup, true);
  renderQuiz(); renderExplore(); renderPattern(); renderMemory(); renderParentGate();
  renderAll();
})();
