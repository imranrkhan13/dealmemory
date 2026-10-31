# DealMemory™

> **Product Memory & Real-Time Activation Engine for SaaS and AI Agents**

DealMemory sits between **product analytics** and **customer memory**. Analytics tools tell you *how many* users did something; DealMemory reveals *what a specific user did* and *what context your team should remember*. 

When a user signs up, opens the dashboard, creates a project, tries to connect an integration, then stops, DealMemory reconstructs that exact sequence as an interactive timeline. The founder can immediately see the user's last recorded action and diagnose where onboarding broke, without digging through server logs or guessing from generic dashboard metrics.

Built with Next.js 14, PostgreSQL, Prisma ORM, and a sleek **white and light-blue** console design inspired by [Supermemory.ai](https://supermemory.ai).

---

## ⚡️ Quickstart

Get a local instance running in under 2 minutes:

```bash
# 1. Clone the repository
git clone https://github.com/your-org/dealmemory.git
cd dealmemory

# 2. Install dependencies
npm install

# 3. Copy environment template & configure
cp .env.example .env

# 4. Initialize local PostgreSQL schema
npx prisma db push

# 5. Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000):
- Create your administrator workspace at `/signup`.
- Generate your public `pk_live_...` project key in `/settings`.
- Send events and watch the `/overview` dashboard update live.

---

## 📖 Complete Documentation

| Guide | Description |
| :--- | :--- |
| [**Installation & Self-Hosting Guide**](docs/INSTALLATION.md) | PostgreSQL setup, Docker, Prisma migrations, environment variables, and production deployment. |
| [**Client SDK & Integration Guide**](docs/SDK-GUIDE.md) | TypeScript, Python, cURL, standard milestone catalog, edge privacy redaction, and offline queues. |
| [**API Reference**](docs/API-REFERENCE.md) | Batch ingestion endpoints, idempotency, keys API, Dodo Payments, and webhooks. |
| [**Console User Guide**](docs/CONSOLE-GUIDE.md) | Walkthrough of the Supermemory-style dashboard, metric cards, 30-day timeline charts, and journeys. |

---

## 📦 Client SDK Installation & Integration

DealMemory provides client libraries with **zero external tracking bloat**, **edge credential sanitization**, and **idempotent delivery**.

### 1. Zero-Dependency cURL / Native Fetch

You can emit milestone events over HTTP without installing any package:

```typescript
const response = await fetch('http://localhost:3000/api/v1/events/batch', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-project-key': 'pk_live_your_key_here'
  },
  body: JSON.stringify({
    events: [
      {
        id: crypto.randomUUID(),
        projectKey: 'pk_live_your_key_here',
        name: 'trial_started',
        userId: 'user_48291',
        occurredAt: new Date().toISOString(),
        properties: { plan: 'pro_trial', source: 'pricing_page' }
      }
    ]
  })
});
```

### 2. TypeScript / JavaScript Web SDK

```bash
npm install dealmemory
```

Add your one key to `.env` — that is the entire setup (no project id, no apiUrl, no config file):

```bash
# .env
DEALMEMORY_KEY=pk_live_your_key_here
```

```typescript
import { DealMemory } from 'dealmemory';

const dm = new DealMemory({
  flushIntervalMs: 5000,
  autoCapture: true
});

// Identify user on authentication
dm.identify('user_48291', { company: 'Acme Inc' });

// Track product milestones
dm.trialStarted();
dm.setGoal('connect_github_repo');
dm.integrationConnected({ provider: 'github' });
dm.firstValueReached();
```

### 3. Python SDK

```bash
pip install ./packages/python
```

```python
from agentlens import DealMemory

dm = DealMemory(
    project_key="pk_live_your_key_here",
    api_url="http://localhost:3000/api"
)

dm.identify("user_48291")
dm.track("report_generated", {"format": "pdf", "pages": 14})
```

---

## 🛡️ Edge Privacy & Credential Redaction

DealMemory enforces zero-trust privacy rules at both client and server layers:

- **Automatic Credential Sanitization**: Bearer tokens, JWTs, API keys (`pk_live_`, `sk_live_`), and private keys are detected and rejected.
- **Sensitive Key Exclusion**: Properties named `password`, `token`, `secret`, `message`, or `value` are automatically blocked.
- **Query Parameter Stripping**: URLs and referrers have query parameters (`?token=...`, `?code=...`) stripped before transmission.
- **No Keystroke / Screen Recording**: DealMemory never records user inputs, form values, or screen video.

---

## 🖥️ Supermemory-Style Console Dashboard

The DealMemory console replicates the clean, minimalist look of `console.supermemory.ai`:

- **Split Navigation**: Public visitors see only public pages (`Demo`, `Pricing`, `Docs`, `Sign in`, `Get started`). The full operational console activates after sign-in.
- **Sidebar Organization**:
  - `Overview`: Live metrics, 30-day vertical request bar chart, namespace distributions, recent memories, and search latencies.
  - `DATA`: Namespaces, Memory Graph, Connectors, Import.
  - `DEVELOPER`: API Keys, Agents & MCP, Requests (Event Inspector), User Insights.
- **Top Header**: Workspace selector (`[F] Fella Free ⌵`), Help, and Documentation shortcut.

---

## 💳 Billing with Dodo Payments

DealMemory includes native billing integration with **Dodo Payments**:

- **Pricing Page**: `/pricing` with Free and Pro tiers.
- **Checkout Session API**: `/api/billing/checkout` generates hosted checkout sessions.
- **Customer Portal API**: `/api/billing/customer-portal` allows users to manage payment methods and cancellation.
- **Webhook Verifier**: `/api/webhooks/dodo` validates standard webhook signatures using `standardwebhooks` with atomic deduplication.
- **Feature Gating**: Enforce Pro limits in server routes via `requirePro(userId)` and `isProUser(userId)` from `lib/billing.ts`.

---

## 🧪 Testing & Verification

Run the comprehensive test suites:

```bash
# Type check and code standards
npm run typecheck
npm run lint

# Run unit tests
npm test

# Run database integration tests
npm run test:integration

# Run multi-tenant HTTP isolation test
npx tsx scripts/test-two-accounts.mjs

# Build production bundle
npm run build
```

---

## 📂 Project Structure

```
dealmemory/
├── app/                      # Next.js App Router (pages, layouts, API routes)
│   ├── (public)/             # Landing, Demo, Pricing, Docs (/sdk), Login, Signup
│   ├── overview/             # Supermemory Console Overview dashboard
│   ├── events/               # Telemetry Requests & raw event inspector
│   ├── journeys/             # User journey reconstruction & drop-off analysis
│   ├── settings/             # Workspace API keys, webhooks, billing
│   └── api/                  # REST endpoints (events, keys, billing, webhooks)
├── components/               # React UI components (AppShell, Overview, Guides)
├── docs/                     # Detailed architectural and user documentation
│   ├── INSTALLATION.md       # Self-hosting, Docker, and PostgreSQL guide
│   ├── SDK-GUIDE.md          # TypeScript, Python, and cURL SDK documentation
│   ├── API-REFERENCE.md      # Full REST API & Webhook specifications
│   └── CONSOLE-GUIDE.md      # Console UI and metric walkthrough
├── lib/                      # Core business logic, db client, billing, privacy
├── packages/
│   ├── sdk/                  # TypeScript / JavaScript client library
│   └── python/               # Python client library
└── prisma/                   # Database schema & migrations
```

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
