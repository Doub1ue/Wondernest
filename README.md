# 🌟 WonderNest

**Big Questions. Little Explorers. Endless Wonder.**

WonderNest is a safe, colorful, interactive learning playground for children ages **3–11**.
Learning feels like an adventure — not homework. Parents create child-safe accounts so each
child's progress (stars, badges, treehouse, missions) is saved on the server and restored at login.

## ✨ What's inside

- **Mascot Nori**, a friendly little explorer who guides children everywhere
- **Three age groups** that re-theme all content: Little Explorers (3–5), Curious Kids (6–8), Super Thinkers (9–11)
- **Learn** — age-specific quizzes (math, science, words) with friendly fact feedback; correct answers earn stars
- **Explore** — discovery cards (space, dinosaurs, oceans, animals, inventions, amazing places) plus a branching **Story Quest**
- **Create** — drawing pad (save as PNG, earns a star) and WebAudio music pads
- **Play** — Memory Match and Pattern Detective games
- **Today's Adventure** — a daily-rotating challenge; completing it earns bonus stars once per day
- **Wonder Missions** — real-world, screen-free activities that earn rewards
- **Treehouse** — grows a new decoration every 5 stars (up to 8); stars also raise the child's adventure level
- **My Adventure** — level, stars, badges, missions, creations, subject progress, history, and a changeable explorer character
- **Parent Zone** — behind its own grown-up math check: safety/privacy/accessibility info plus the logged-in child's progress by subject, recent activity, and a recommendation
- **Accessibility** — bigger-text, high-contrast, and calm (reduced-motion) toggles on every page; large touch targets; responsive on tablets, phones, and desktops

## 🛡️ Safety & privacy by design

- A **grown-up math gate** must be passed before an account can be created, and again to enter the Parent Zone
- Accounts need only a **child-chosen username + PIN/password** — **no child email, no real name, no personal data**
- PINs are stored **only as scrypt hashes with per-account salts** — never in plain text
- Sessions use **HttpOnly cookies** with server-side tokens
- **No chat, no messaging, no public profiles, no leaderboards, no ads, no external links for children**

## 🛠️ Tech

- **Node.js ≥ 18, zero npm dependencies** — built-in `http` server and `crypto` only
- Single-page frontend in `public/` (vanilla HTML/CSS/JS, no build step)
- Data stored in `data/db.json` (created at runtime, git-ignored) with atomic writes (temp file + rename)

> ⚠️ Note on free hosting: the JSON file store works great locally and on hosts with a
> persistent disk. On Render's **free** tier the filesystem is ephemeral — data resets when
> the service restarts or redeploys. For a small family/friends launch that's usually fine;
> for durable production data, attach a Render Disk (paid) or swap the store for a database.

## ▶️ Run locally

```bash
npm start
# WonderNest listening on port 3000
```

Open http://localhost:3000 — or set a different port: `PORT=8080 npm start`

## 🚀 Deploy to Render (free tier)

1. Push this repo to GitHub.
2. Go to [render.com](https://render.com) → **New +** → **Web Service** (or **Blueprint** and pick this repo — a `render.yaml` is included).
3. Connect your GitHub repo.
4. Settings:
   - **Runtime:** Node
   - **Build Command:** *(leave empty — there are no dependencies to install; `npm install` also works)*
   - **Start Command:** `npm start`
   - **Plan:** Free
5. Click **Create Web Service**. Render gives you a URL like `https://wondernest-xxxx.onrender.com`.
6. (Free tier services sleep after inactivity and take ~30–60s to wake on the first visit.)

## 🌐 Point your own domain at it

1. In Render: your service → **Settings** → **Custom Domains** → **Add Custom Domain** (e.g. `play.yourdomain.com` or `yourdomain.com`).
2. At your DNS provider, add the record Render shows you — typically:
   - Subdomain: a **CNAME** record pointing to your `*.onrender.com` hostname.
   - Root domain: follow Render's instructions (an A record to the IP Render provides, or use a subdomain instead).
3. Wait for DNS to propagate and for Render to issue the free HTTPS certificate (automatic).

Example for a subdomain:

| Type  | Name  | Value                          |
|-------|-------|--------------------------------|
| CNAME | play  | wondernest-xxxx.onrender.com  |

## 📁 Project layout

```
server.js          # zero-dependency Node server + JSON API
public/
  index.html       # single-page app shell
  styles.css
  app.js           # all frontend logic and content
data/
  .gitkeep         # db.json is created here at runtime (git-ignored)
package.json
render.yaml        # Render blueprint
```

## 🔌 API (JSON, under `/api/`)

| Endpoint | Method | Description |
|---|---|---|
| `/api/gate` | GET | Get a grown-up math challenge |
| `/api/gate` | POST | Answer it — sets a short-lived gate cookie |
| `/api/signup` | POST | Create a child account (requires gate cookie); logs in |
| `/api/login` | POST | Log in with username + PIN |
| `/api/logout` | POST | Log out |
| `/api/me` | GET | Current account + progress |
| `/api/progress` | GET | Saved progress |
| `/api/progress` | PUT | Save progress (and optionally age group / character) |

All input is validated and sanitized; error messages are generic on purpose.
