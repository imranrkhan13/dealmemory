# DealMemory Web SDK

Privacy-safe product memory for your app. It records what each user did — page views, clicks, form submissions, scroll depth, errors — as a readable timeline, with zero manual instrumentation.

```bash
npm install dealmemory
```

---

## ⚠️ Install this in your FRONTEND, not your backend

DealMemory tracks **browser activity** — what users click and where they get stuck. It belongs in the app your users actually open:

| Your stack | Install & init in | Env var name |
|---|---|---|
| Next.js (App or Pages Router) | the Next.js app | `DEALMEMORY_API_KEY` + `NEXT_PUBLIC_DEALMEMORY_API_KEY` |
| Vite / React / Vue / Svelte / CRA | the frontend app | `DEALMEMORY_API_KEY` (or `VITE_DEALMEMORY_API_KEY`) |
| Plain HTML / server templates (Flask, Django, FastAPI + Jinja) | the templates folder | key is inlined by the CLI |
| Backend-only API (Node/Python, no UI) | ❌ not needed | — |

**Do NOT** install it in your API/backend service (Render, Railway, Express server, etc.) unless you specifically want server-side events. The backend never needs the key for normal tracking — events go straight from the user's browser to DealMemory.

---

## Quickstart (local dev)

```bash
# 1. Install
npm install dealmemory

# 2. Run the installer — it finds your framework and writes the tracking code
npx dealmemory init

# 3. Paste your key (get it from DealMemory → Settings → API Keys)
#    into the .env file it created/updated:
DEALMEMORY_API_KEY=pk_live_...

# 4. Restart your dev server. Done — events appear in the dashboard immediately.
```

The CLI auto-detects Next.js, Vite/React/Vue/Svelte, plain `index.html`, and Python templates — including monorepos where the app lives in a subfolder (`frontend/`, `apps/web/`). It is idempotent: running it twice changes nothing.

If detection fails it prints the exact two lines to paste manually.

---

## Hosted deploys (Netlify, Vercel, Render, etc.)

Env vars are **inlined at build time** for browser tracking, so you must set them *before* building and then **redeploy**.

### Netlify / Vercel (Next.js frontend)

Dashboard → Site settings → **Environment variables**, then trigger a new deploy:

```
NEXT_PUBLIC_DEALMEMORY_API_KEY = pk_live_...
DEALMEMORY_API_KEY             = pk_live_...   # optional
```

Or in `netlify.toml`:

```toml
[context.production.environment]
  NEXT_PUBLIC_DEALMEMORY_API_KEY = "pk_live_..."
```

### Vite / CRA / other bundlers

Set `DEALMEMORY_API_KEY` (Vite also reads `VITE_DEALMEMORY_API_KEY`) in your host's env vars, then redeploy.

### Render / Railway / Fly (backend)

**Nothing to do** — the key is not needed server-side for auto-tracking.

### What to commit & push

- ✅ Commit: `package.json`, `package-lock.json`, and the entry file the CLI edited (`app/layout.tsx`, `src/main.tsx`, `index.html`, `templates/base.html`, …)
- ❌ Do NOT commit: `.env` files (your host injects env vars at build time)

---

## Usage

Auto-capture is on by default — page views, clicks, form submissions, scroll depth, input changes (no values), errors, and time on page. Clicks and submits are auto-named from the element text (`click_sign_up`, `submit_contact_form`).

```ts
// zero-code path: the CLI already wrote this import into your entry file
import 'dealmemory/auto';

// or the shared client — configures itself from the environment
import { DealMemory, track, identify } from 'dealmemory';

const dm = new DealMemory(); // reads DEALMEMORY_API_KEY from the environment

dm.identify('user_123', { plan: 'trial' });
dm.track('trial_started');
dm.setGoal('Create my first project');

// named events from anywhere
track('checkout_started', { plan: 'pro' });
```

## Privacy

Never captures form values, passwords, tokens, credit card numbers, keystrokes, screen recordings, or session replay. Credential-shaped strings are stripped before anything is queued. Set `autoCapture: false` for explicit events only, or add `data-agentlens-action="invite_team"` to give an interaction a stable name.

## API

`identify`, `track`, `page`, `setGoal`, `flush`, `reset`, `destroy`, plus milestone helpers: `trialStarted`, `integrationConnected`, `firstValueReached`, `checkoutStarted`, `checkoutCompleted`, `subscriptionCreated`, `teamInvited`, `apiError`.

## Troubleshooting

- **"Module not found: dealmemory/auto" at build time** → the package isn't in this app's `package.json`. Run `npm install dealmemory` in the *frontend* directory, commit `package.json` + lockfile, redeploy.
- **No events in dashboard** → confirm `NEXT_PUBLIC_DEALMEMORY_API_KEY` (Next.js) is set in the host env vars and you redeployed *after* setting it. Check browser devtools → Network for calls to `/api/v1/events/batch`.
- **401 invalid key** → key doesn't exist in DealMemory → Settings → API Keys → generate a new `pk_live_...`.
