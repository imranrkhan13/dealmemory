# How DealMemory Works — End-to-End

DealMemory is a product analytics & customer memory platform for SaaS trials. It captures every user interaction, reconstructs their journey, diagnoses where they get stuck, and provides AI-powered recommendations — all from a **single environment variable**.

## 1. Installation — One Key, One Command

```bash
# 1. Install the SDK
npm install dealmemory

# 2. Initialize — the CLI writes tracking code into your files
npx dealmemory init

# 3. Add your API key — the only env var you'll ever need
# .env file:
DEALMEMORY_API_KEY=pk_live_...
```

That's it. No `projectKey` in code, no `apiUrl`, no config object. The CLI (`npx dealmemory init`) auto-detects your framework (Next.js pages router, app router, or vanilla React) and injects the correct import + key line.

## 2. How Tracking Works

### The SDK reads one key: `DEALMEMORY_API_KEY`

The SDK (`packages/sdk/src/client.ts`) reads the key in this order:

1. `DEALMEMORY_API_KEY` (primary)
2. `NEXT_PUBLIC_DEALMEMORY_API_KEY` (for Next.js bundler inlining)
3. `DEALMEMORY_KEY` (legacy fallback)
4. `DEALMEMORY_PROJECT_KEY` (legacy fallback)

Once the key is read, the SDK automatically tracks these events by default:

- `user_signed_up` — when account is created
- `app_opened` — every time the app loads
- `feature_used` — when core features are used
- `dashboard_opened` — when user views the dashboard
- `project_created` — when a new project/workspace is created
- `integration_connect_attempted` — when connecting GitHub or other integrations
- `integration_connected` — when integration succeeds
- `integration_connection_failed` — when OAuth/connection fails
- `first_map_generated` — when the user's first map/visualization is created
- `checkout_started` — when user starts a purchase
- `payment_completed` — when payment succeeds (verified webhook)
- `trial_started` — when trial begins

**Every event is automatically deduplicated**, enriched with user traits (email, company, role), and sent to your PostgreSQL database via the HTTP API.

### Zero-Config Tracking via `dealmemory/auto`

```ts
// app/dealmemory.client.ts (created by npx dealmemory init)
"use client"
import './dealmemory.client'
// OR simply:
import 'dealmemory/auto'
// Everything is tracked automatically from this point.
```

`import 'dealmemory/auto'` creates a shared singleton client from the environment and starts tracking. All `track/identify/setGoal/page/flush/reset` functions are proxied lazily through the same singleton. If no key is found, every call silently no-ops (never throws into your code).

## 3. Data Flow — From Event to Insight

```
User Event → SDK → HTTP API → PostgreSQL → Intelligence → AI Recommendations
```

### Step 1: Event Ingestion

Events are sent via `agentlens.track('event_name', { properties })` or automatically via `dealmemory/auto`. The SDK:

- Generates a `payloadHash` (SHA256) for deduplication
- Strips credentials from URLs and properties (auto-detects `pk_live`, `sk_live`, `whsec`, Bearer tokens, JWTs, PEM blocks, passwords)
- Sends to `/api/v1/events/batch` in batches

### Step 2: Journey Reconstruction

The `intelligence.ts` module reconstructs each user's canonical journey:

- **Normalizes** events (dedupes by ID, sorts by time)
- **Filters** invalid events (e.g., `checkout_started` before activation)
- **Builds** a canonical sequence: `trial_started → repository_connected → first_map_generated → checkout_started → payment_completed`
- **Detects blockers**: GitHub auth failure, first value not reached, checkout not completed
- **Generates diagnoses**: friction, milestone achieved, exploration, creation, or general

### Step 3: Customer Memory Capsules

For each user, a `CustomerMemoryCapsule` synthesizes:

- **Title**: e.g., "Friction: OAuth timeout" or "Alice · SaaS Analytics"
- **Summary**: Executive story of time spent, what they loved, and their outcome
- **Intent**: Stated goals, searches, or interests
- **Tech Stack**: Providers, frameworks, languages detected from events
- **Friction Points**: Errors encountered during onboarding
- **Suggested Action**: AI-generated recommendation based on diagnosis

### Step 4: AI-Powered Insights

The `gemini.ts` module queries Google Gemini 2.5 Flash over the live telemetry:

- Fetches trial users, their journeys, recent events from PostgreSQL
- Sends context-aware prompts to Gemini
- Returns executive summaries, recommended next steps, and friction detection
- Gracefully falls back to ground-truth telemetry if Gemini quota is exhausted

### Step 5: Predictive Analytics (New)

The new `lib/predictive-analytics.ts` module adds:

- **`predictConversionProbability(userId, projectId)`** — Returns a score 0.0–1.0 based on behavioral patterns, time-in-state, friction ratio, milestone ratio, and recent activity velocity. Includes positive/negative factors and confidence level ('high'/'medium'/'low').

- **`discoverFunnels(projectId, minSupport)`** — Automatically discovers the most common 3-step conversion paths from actual user sequences. Identifies top funnels and drop-off points without hardcoded funnel names.

- **`identifyAtRiskUsers(projectId, threshold)`** — Returns users with conversion probability below a threshold (default 0.3), including their last action, inactive hours, and recommendations.

- **`predictNextAction(userId, projectId)`** — Predicts the user's next likely action based on behavioral similarity to users with matching event prefixes. Returns the action, probability, number of similar users, and rationale.

- **`behavioralClustering(projectId, k)`** — Clusters users into archetypes based on event patterns: Explorers (browsing/content), Creators (actively configuring), Friction Stall (encountered errors), Activated (highly engaged), and General (mixed patterns). Returns clusters with centroids, user lists, and recommendations.

- **`buildUserPredictionSummary(userId, projectId)`** — Returns a compact summary: conversion probability, at-risk status, next likely action, behavioral archetype, and current funnel step.

## 4. API Routes

### `GET /api/v1/analytics/predict?projectId=xxx`

Returns comprehensive predictive analytics for a project:

```json
{
  "conversionScores": [{userId, conversionProbability, atRisk, positiveFactors, negativeFactors}],
  "funnelDiscovery": {topFunnel, funnels, dropOffPoints, totalUsers},
  "atRiskUsers": [{userId, probability, lastAction, inactiveHours, recommendation}],
  "nextActionPredictions": [{nextAction, probability, similarUsers, rationale}],
  "clustering": {clusters, error},
  "userSummaries": [{userId, conversionProbability, atRisk, nextLikelyAction, behavioralArchetype, funnelStep}],
  "metadata": {totalUsers, generatedAt}
}
```

### `GET /api/v1/journeys` — Returns all user journeys with diagnoses
### `GET /api/v1/events/recent` — Returns recent events
### `POST /api/v1/demo/reset` — Resets demo data

## 5. Intelligence Dashboard

The `components/intelligence-dashboard.tsx` displays:

- **Conversion probability badges** for all users (green > 60%, yellow 30-60%, red < 30%)
- **At-risk users list** with probability, inactivity hours, and recommended next actions
- **Next-action predictions** for the top 3 at-risk users
- **Automatic funnel discovery** — the most common conversion path with conversion rate
- **Behavioral clusters** — user segments (Explorers, Creators, Friction Stall, Activated, General)
- **Classic funnel visualization** with stage counts and percentages
- **Blocker analysis** — GitHub auth is the largest blocker
- **User journey table** with current stage, last event, time inactive, blocker, and recommendation

## 6. AI Copilot Synthesis

Via `GET /api/v1/ai/ask?projectId=xxx&question=...`, founders can ask:

> "What's the top blocker for my trial users and what should I do about it?"

The system queries Gemini over the live telemetry and returns:

- **Clear telemetry breakdown**: Active dwell time, top feature affinity, last action, onboarding status
- **2-3 sentence Executive Summary**: Reads like a senior product leader explaining user behavior
- **Concrete Recommended Next Step**: Actionable advice based on real data

Onboarding status is carefully distinguished: "Healthy · No friction detected" unless an actual error blocker occurred.

## 7. Pricing & Projects

- **Starter (Free)**: 1 project workspace, up to 10,000 monthly events
- **Growth Pro ($49/mo)**: Unlimited projects, each with its own keys, events, journeys, and AI memory
- **Multi-project**: Upgrade to Pro and a "New project" button appears in Settings. Each project gets independent API keys, event history, user journeys, and AI memory — no cap on how many you run.

## 8. What the User Actually Does

```bash
# One-time setup:
npm install dealmemory      # installs SDK
npx dealmemory init         # CLI writes code into your files
# .env:
DEALMEMORY_API_KEY=pk_live_...

# In your code — track automatically:
import 'dealmemory/auto'
// Or: import { track, identify, setGoal } from 'dealmemory'

# That's it. Everything else is automatic:
# - Events appear in your dashboard within seconds
# - Journeys are reconstructed automatically
# - Blockers are detected automatically
# - AI recommendations appear automatically
# - Conversion probabilities are computed automatically
# - Funnels are discovered automatically
# - At-risk users are identified automatically
```

## 9. Key Design Decisions

| Decision | Reason |
|----------|--------|
| **One env var** (`DEALMEMORY_API_KEY`) | Minimize setup friction; all fallbacks ensure backward compatibility |
| **Automatic credential redaction** | Prevent secrets from leaking into event data |
| **No hardcoded funnel names** | Funnels should be discovered from data, not imposed |
| **Probabilistic scoring** | Conversion is a behavior pattern, not a binary state |
| **Behavioral clustering over rigid funnels** | Users take different paths; clustering captures the diversity |
| **AI as layer on top of telemetry** | Ground-truth data first; AI synthesizes, doesn't fabricate |
| **Silent no-op when key missing** | Never break existing code if the key isn't configured |

## 10. Limits & Conventions

- **Events per month**: Starter: 10,000; Pro: Unlimited
- **Projects**: Starter: 1; Pro: Unlimited
- **Event names**: Use snake_case (e.g., `trial_started`, `first_map_generated`)
- **Properties**: JSON-serializable; credentials automatically stripped
- **User IDs**: `user_` prefix for identified users, `anon:` prefix for anonymous
- **SDK reads**: `process.env.DEALMEMORY_API_KEY` on server, `NEXT_PUBLIC_*` in browser
- **CLI idempotency**: `npx dealmemory init` can be run multiple times — second change nothing

---
*DealMemory — product memory for SaaS trials. Capture every interaction. Understand every journey. Act on every insight.*