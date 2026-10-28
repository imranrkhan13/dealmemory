# DealMemory Client SDK & Integration Guide

DealMemory provides lightweight, zero-bloat client libraries for web browsers, Node.js runtimes, Python applications, and direct HTTP clients. All clients implement **privacy-first edge sanitization**, **idempotent delivery**, and **automatic offline queuing**.

---

## Table of Contents

1. [Architecture & Philosophy](#1-architecture--philosophy)
2. [Quick Integration (cURL & Fetch)](#2-quick-integration-curl--fetch)
3. [TypeScript / JavaScript SDK](#3-typescript--javascript-sdk)
4. [Python SDK](#4-python-sdk)
5. [Standard Milestone Event Catalog](#5-standard-milestone-event-catalog)
6. [Edge Privacy & Credential Redaction](#6-edge-privacy--credential-redaction)
7. [Reliability, Queuing & Idempotency](#7-reliability-queuing--idempotency)

---

## 1. Architecture & Philosophy

Traditional product analytics tools inject heavy client bundles, record sensitive form values, or stream invasive session replays. DealMemory takes the opposite approach:

- **Zero Invasive Tracking**: DealMemory never records passwords, user keystrokes, personal messages, or form inputs.
- **Edge Sanitization**: Client libraries automatically scan and drop credentials (API keys, JWTs, Bearer tokens) before events leave the host device.
- **Deduplication by Default**: Every event carries a UUID. Retried network requests are resolved via atomic SQL idempotency on the server without duplicate counting.
- **Offline Resilience**: Web events are persisted to browser `localStorage` and flushed with bounded exponential jitter.

---

## 2. Quick Integration (cURL & Fetch)

No external libraries are required to send product actions to DealMemory. You can emit events directly over standard HTTP POST requests.

### JavaScript (Native `fetch`)

```typescript
const event = {
  id: crypto.randomUUID(),
  projectKey: 'pk_live_your_project_key',
  name: 'trial_started',
  userId: 'user_98721',
  anonymousId: 'anon_34291',
  sessionId: crypto.randomUUID(),
  occurredAt: new Date().toISOString(),
  properties: {
    plan: 'pro_trial',
    referrer: 'github'
  }
};

const response = await fetch('https://your-dealmemory-host.com/api/v1/events/batch', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-project-key': 'pk_live_your_project_key'
  },
  body: JSON.stringify({ events: [event] })
});

const result = await response.json();
console.log('Ingestion result:', result);
```

### cURL

```bash
curl 'https://your-dealmemory-host.com/api/v1/events/batch' \
  -H 'Content-Type: application/json' \
  -H 'x-project-key: pk_live_your_project_key' \
  --data '{
    "events": [
      {
        "id": "c71a39f0-2bf7-4e94-9844-3d024b819f71",
        "projectKey": "pk_live_your_project_key",
        "name": "integration_connected",
        "userId": "user_123",
        "occurredAt": "2026-10-28T12:00:00Z",
        "properties": {
          "provider": "github"
        }
      }
    ]
  }'
```

---

## 3. TypeScript / JavaScript SDK

The DealMemory TypeScript SDK is located in `packages/sdk` and can be imported into web apps, React, Next.js, Vue, or Node.js services.

### Installation

```bash
# Using the local workspace package
npm install ./packages/sdk

# Or after publishing to your private registry
npm install @dealmemory/sdk
```

### Initializing the Client

```typescript
import { DealMemory } from '@dealmemory/sdk';

export const dm = new DealMemory({
  projectKey: 'pk_live_your_project_key',
  apiUrl: 'https://your-dealmemory-host.com/api',
  flushIntervalMs: 5000, // Flush frequency (default: 5000ms)
  autoCapture: true,     // Captures page views and element actions
  privacy: {
    captureQueryString: false, // Automatically strips ?query=params
    blockedEvents: ['internal_healthcheck']
  }
});
```

### Identifying Users

Associate subsequent events with a known user identifier:

```typescript
// On sign-in or session start
dm.identify('user_94812', {
  company: 'Acme Corp',
  role: 'Engineering Lead'
});
```

### Tracking Product Milestones

```typescript
// Explicit milestone tracking
dm.track('repository_connected', {
  repoName: 'dealmemory-core',
  branchCount: 4
});

// Setting user activation goals
dm.setGoal('deploy_first_agent');

// Convenience milestone triggers
dm.trialStarted();
dm.firstValueReached();
dm.checkoutStarted();
dm.checkoutCompleted();
dm.integrationConnected({ provider: 'slack' });
```

### Resetting Sessions

Clear stored user identifiers and session IDs upon user sign-out:

```typescript
dm.reset();
```

---

## 4. Python SDK

The Python SDK is located in `packages/python` and provides a synchronous, thread-safe client for FastAPI, Django, Flask, and background workers.

### Installation

```bash
pip install ./packages/python
```

### Usage

```python
from agentlens import DealMemory

client = DealMemory(
    project_key="pk_live_your_project_key",
    api_url="https://your-dealmemory-host.com/api",
    timeout=5.0
)

# Identify authenticated user
client.identify("user_84920")

# Record activation milestone
client.track("report_exported", {
    "format": "csv",
    "rows": 1250
})

# Goal declaration
client.set_goal("enable_daily_digest")
```

---

## 5. Standard Milestone Event Catalog

DealMemory utilizes standardized event names to power canonical journey reconstruction and funnel drop-off analytics:

| Event Name | Recommended Timing | Example Context |
| :--- | :--- | :--- |
| `trial_started` | User creates account or begins free trial | `{ "plan": "trial", "source": "landing_page" }` |
| `goal_set` | User defines primary objective during onboarding | `{ "goal": "automate_support_inbox" }` |
| `integration_connected` | User links third-party OAuth provider | `{ "provider": "github", "scope": "read" }` |
| `integration_failed` | Third-party OAuth or API connection fails | `{ "provider": "slack", "errorCode": "oauth_denied" }` |
| `first_value_reached` | User hits the primary "aha moment" in your product | `{ "durationMinutes": 4 }` |
| `action_clicked` | Auto-captured interaction with UI buttons | `{ "action": "create_workflow_button" }` |
| `form_submitted` | Auto-captured submission of forms | `{ "form": "workspace_settings_form" }` |
| `checkout_started` | User enters subscription checkout screen | `{ "tier": "pro_annual" }` |
| `checkout_completed` | Payment completed and verified | `{ "tier": "pro_annual", "currency": "USD" }` |
| `subscription_cancelled`| User churns or downgrades | `{ "reason": "budget_constraints" }` |

---

## 6. Edge Privacy & Credential Redaction

DealMemory enforces zero-trust privacy rules at both the client SDK level and server ingestion endpoint:

### Regex Patterns Blocked & Sanitized

Any event property containing strings matching the following patterns is rejected or redacted:

```regex
(?:pk_live|sk_live|whsec)_[a-zA-Z0-9_]{16,}
\bBearer(?:\s|%20)+[a-zA-Z0-9_\-\.~+/]{16,}={0,2}
\beyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}
-----BEGIN[ A-Z0-9_-]*PRIVATE KEY-----
(?:password|token|secret)\s*=\s*['"]?[^\s'";&]{3,}['"]?
```

### Property Key Restrictions
Property keys containing keywords such as `password`, `token`, `secret`, `message`, `text`, or `value` are automatically excluded to avoid leaking sensitive credentials or PII.

### URL Sanitization
All page URLs and referrers have query parameters (`?code=...`, `?token=...`) and hash fragments stripped before submission.

---

## 7. Reliability, Queuing & Idempotency

### LocalStorage Queue
The browser SDK queues events in `localStorage` under `agentlens:<projectKey>:queue`, up to a limit of 1,000 events. If the client is offline, events accumulate safely and flush once connectivity returns.

### Exponential Backoff & Jitter
When an ingestion endpoint returns network errors or `5xx` responses, the SDK backs off with randomized exponential jitter (up to a 5-minute cap) to avoid hammering your servers:
```typescript
retryDelay = Math.min(300000, 1000 * 2^failures * (0.5 + Math.random()))
```

### Atomic 409 Deduplication
If a batch contains an event that was already accepted, DealMemory returns `409 Conflict` alongside a list of conflicting event IDs. Valid non-conflicting events are committed, and the client removes accepted events from its local queue without infinite resend loops.
