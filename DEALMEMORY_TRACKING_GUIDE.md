# DealMemory Tracking Guide: How It Works & How to Fix Issues

## Executive Summary

DealMemory is a product analytics and customer memory platform that:
- **Tracks user events** via SDK or direct API calls
- **Stores events** in PostgreSQL with automatic deduplication
- **Reconstructs user journeys** from event sequences
- **Diagnoses blockers** where users get stuck
- **Provides AI-powered insights** on user behavior

**Current Issue**: Tracking is not working because the API key in your `.env` file (`pk_live_test123456789abcdef`) does not exist in the database. Events cannot be ingested without a valid project key.

---

## 1. How DealMemory Tracking Works - Step by Step

### Step 1: User Action (SDK or API)

The SDK captures events in two ways:

**Automatic Tracking (via `dealmemory/auto`)**:
```typescript
import 'dealmemory/auto';
// Automatically tracks EVERYTHING:
// - page_view (on page load)
// - action_clicked (all button/link clicks with text)
// - form_submitted (all form submissions)
// - scroll_depth (at 25%, 50%, 75%, 90%, 100%)
// - input_changed (debounced, no sensitive data)
// - error_occurred (JavaScript errors)
// - time_on_page (when user leaves page)
```

**Manual Tracking**:
```typescript
import { DealMemory } from 'dealmemory';
const dm = new DealMemory({ projectKey: 'pk_live_...' });
dm.track('trial_started', { plan: 'pro' });
dm.identify('user_123', { email: 'user@example.com' });
```

**Direct API Call**:
```bash
curl -X POST 'http://localhost:3000/api/v1/events/batch' \
  -H 'Content-Type: application/json' \
  -H 'x-project-key: pk_live_...' \
  -d '{"events": [...]}'
```

### Step 2: SDK Queues & Batches Events

The SDK (`packages/sdk/src/client.ts`):
1. **Creates event objects** with:
   - `id`: Unique UUID
   - `projectKey`: Your API key
   - `name`: Event name (e.g., `trial_started`)
   - `userId`/`anonymousId`: User identifier
   - `sessionId`: Current session
   - `occurredAt`: ISO timestamp
   - `properties`: Custom data (sanitized)
   - `url`/`referrer`: Page info (query params stripped)

2. **Sanitizes data**:
   - Removes credentials (tokens, passwords, API keys)
   - Strips sensitive property names (`password`, `token`, `secret`)
   - Limits to 20 properties, 80 char keys, 500 char values

3. **Queues events** in memory + localStorage (up to 1000 events)

4. **Flushes every 5 seconds** (configurable) via POST to `/api/v1/events/batch`

### Step 3: API Endpoint Validates & Ingests

The endpoint (`app/api/v1/events/batch/route.ts`):

1. **Validates payload**:
   - Size limit: 256 KB
   - Event count: 1-100 per batch
   - Schema validation via Zod

2. **Validates API key**:
   - Extracts prefix from key (e.g., `pk_live_abc123def456`)
   - Looks up key in `ProjectApiKey` table
   - Verifies full key matches stored bcrypt hash
   - Checks key is not revoked
   - **THIS IS WHERE YOUR TEST KEY FAILS** - it doesn't exist in the database

3. **Checks plan limits**:
   - Starter: 10,000 events/month
   - Pro: Unlimited

4. **Calls `ingest()` function** from `lib/event-store.ts`

### Step 4: Database Ingestion

The `ingest()` function (`lib/event-store.ts`):

1. **Creates trial users** (if new):
   ```sql
   INSERT INTO TrialUser (projectId, externalUserId)
   ```

2. **Stores events** with deduplication:
   ```sql
   INSERT INTO ActivationEvent (
     projectId, eventId, trialUserId, sessionId,
     name, properties, occurredAt, anonymousId,
     url, referrer, payloadHash
   )
   ON CONFLICT (projectId, eventId) DO NOTHING
   ```

3. **Updates user traits** (if event has email/company/role):
   ```sql
   UPDATE TrialUser
   SET attributes = merged_traits, email = email
   ```

4. **Optionally writes to Supermemory** (if configured)

5. **Returns response**:
   ```json
   {
     "ok": true,
     "accepted": 5,
     "deduplicated": 2,
     "conflicts": [],
     "rejected": [],
     "memory": [...]
   }
   ```

### Step 5: Journey Reconstruction

The `journeys()` function (`lib/intelligence.ts`):

1. **Fetches all events** for a project from PostgreSQL
2. **Groups by user** (userId or anonymousId)
3. **Normalizes events** (dedupes by ID, sorts by time)
4. **Builds canonical journey**:
   - Filters invalid events (e.g., checkout before activation)
   - Detects activation events
   - Identifies payment events

5. **Diagnoses blockers**:
   - GitHub auth failure
   - First value not reached
   - Checkout not completed

6. **Generates customer memory capsule**:
   - Title, summary, intent
   - Tech stack
   - Friction points
   - Suggested action

### Step 6: Dashboard Display

The intelligence dashboard (`components/intelligence-dashboard.tsx`):
- Shows conversion probability for each user
- Lists at-risk users
- Displays next-action predictions
- Shows funnel discovery
- Displays behavioral clusters
- Shows user journey table with blockers

---

## 2. What DealMemory Tracks

### Automatic Events (via `dealmemory/auto`)

| Event Name | Triggered When | Properties |
|------------|----------------|------------|
| `page_view` | Page loads | `name` (page title) |
| `action_clicked` | Button/link clicked | `element`, `action` |
| `form_submitted` | Form submitted | `form` name/id |

### Manual Milestone Events

| Event Name | Purpose | Example Usage |
|------------|---------|---------------|
| `trial_started` | User starts trial | `dm.trialStarted()` |
| `checkout_started` | User begins checkout | `dm.checkoutStarted()` |
| `checkout_completed` | Payment successful | `dm.checkoutCompleted()` |
| `integration_connected` | OAuth/integration success | `dm.integrationConnected({provider: 'github'})` |
| `integration_failed` | OAuth/integration error | `dm.integrationFailed({errorCode: 'auth_timeout'})` |
| `feature_used` | Feature usage | `dm.featureUsed('export_pdf')` |
| `first_value_reached` | User achieves activation | `dm.firstValueReached()` |
| `subscription_created` | Subscription started | `dm.subscriptionCreated()` |
| `subscription_cancelled` | Subscription cancelled | `dm.subscriptionCancelled()` |
| `api_error` | API error occurred | `dm.apiError({status: 500})` |
| `team_invited` | Team member invited | `dm.teamInvited()` |

### Custom Events

You can track any custom event:
```typescript
dm.track('custom_event', { customProp: 'value' });
```

---

## 3. API Endpoints Summary

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/v1/events/batch` | POST | Ingest events (1-100) | Project key (public) |
| `/api/v1/events/recent` | GET | Fetch recent events | Session auth |
| `/api/v1/journeys` | GET | Get all user journeys | Session auth |
| `/api/v1/overview` | GET | Dashboard overview | Session auth |
| `/api/v1/analytics/predict` | GET | Predictive analytics | Session auth |
| `/api/v1/ai/ask` | GET | AI copilot query | Session auth |
| `/api/projects/keys/create` | POST | Generate new API key | Session auth |
| `/api/projects/keys/list` | GET | List project keys | Session auth |

---

## 4. Why Your Tracking Isn't Working

### Root Cause Analysis

**Your `.env` file has**:
```
DEALMEMORY_API_KEY="pk_live_test123456789abcdef"
```

**This key does not exist in the database.**

The API validation flow:
1. Client sends event with `x-project-key: pk_live_test123456789abcdef`
2. Server extracts prefix: `pk_live_test1234567`
3. Server queries `ProjectApiKey` table for this prefix
4. **No matching record found → 401 error**
5. Event is rejected

### Why This Happens

Project keys are **not** simple strings you can set in `.env`. They are:
- Generated through the UI (Settings → API Keys)
- Generated through the API (`/api/projects/keys/create`)
- Stored in the database with bcrypt hashes
- Each key is tied to a specific project and user

### The Fix

You need to create a valid project and key through the application:

#### Option 1: Via Web UI (Recommended)

1. **Start the dev server** (already running):
   ```bash
   npm run dev
   # Running at http://localhost:3000
   ```

2. **Create an account**:
   - Go to http://localhost:3000/signup
   - Enter email, password, name
   - This creates a User and a default Project

3. **Generate API key**:
   - Go to http://localhost:3000/settings
   - Click "Generate New Key"
   - Copy the full key (e.g., `pk_live_abc123def456_...`)

4. **Update your `.env`**:
   ```bash
   DEALMEMORY_API_KEY="pk_live_abc123def456_your_secret_here"
   ```

5. **Restart your app** to pick up the new key

#### Option 2: Via API

1. **Create a user**:
   ```bash
   curl -X POST http://localhost:3000/api/auth/signup \
     -H 'Content-Type: application/json' \
     -d '{
       "email": "test@example.com",
       "password": "password123",
       "name": "Test User"
     }'
   ```

2. **Sign in to get session** (via http://localhost:3000/login)

3. **Create API key** (requires authentication):
   ```bash
   curl -X POST http://localhost:3000/api/projects/keys/create \
     -H 'Content-Type: application/json' \
     -H 'Cookie: <your-session-cookie>' \
     -d '{
       "projectId": "<project-id-from-signup>",
       "kind": "pk_live"
     }'
   ```

4. **Use the returned key** in your `.env`

---

## 5. Testing Tracking After Fix

### Test 1: Manual API Call

```bash
curl -X POST 'http://localhost:3000/api/v1/events/batch' \
  -H 'Content-Type: application/json' \
  -H 'x-project-key: YOUR_REAL_KEY_HERE' \
  -d '{
    "events": [{
      "id": "test-event-001",
      "projectKey": "YOUR_REAL_KEY_HERE",
      "name": "test_event",
      "userId": "user_test_001",
      "anonymousId": "anon_test_001",
      "sessionId": "sess_test_001",
      "occurredAt": "2026-11-04T12:00:00Z",
      "properties": {"test": true}
    }]
  }'
```

Expected response:
```json
{
  "ok": true,
  "accepted": 1,
  "deduplicated": 0,
  "conflicts": [],
  "rejected": [],
  "memory": []
}
```

### Test 2: SDK Integration

```typescript
// In your app
import 'dealmemory/auto';

// or
import { DealMemory } from 'dealmemory';
const dm = new DealMemory({ projectKey: 'YOUR_REAL_KEY_HERE' });
dm.track('test_event', { source: 'manual_test' });
```

### Test 3: Verify in Dashboard

1. Go to http://localhost:3000/overview
2. Check "Recent Events" section
3. Go to http://localhost:3000/journeys
4. Verify events appear in user timelines

---

## 6. Architecture Diagram

```
┌─────────────────┐
│   User Browser  │
│                 │
│  SDK (dealmemory)│
│  - Queues events│
│  - Batches every 5s│
└────────┬────────┘
         │ POST /api/v1/events/batch
         │ x-project-key: pk_live_...
         ▼
┌──────────────────────────────────┐
│  Next.js API Route              │
│  /api/v1/events/batch/route.ts  │
│                                  │
│  1. Validate payload (size, schema)│
│  2. Validate API key (prefix + hash)│
│  3. Check plan limits           │
│  4. Call ingest()                │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│  lib/event-store.ts              │
│  ingest() function               │
│                                  │
│  1. Create TrialUser (if new)    │
│  2. Insert ActivationEvent       │
│     (with deduplication)         │
│  3. Update user traits           │
│  4. Write to Supermemory (opt)   │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│  PostgreSQL Database             │
│                                  │
│  Tables:                         │
│  - User                          │
│  - Project                       │
│  - ProjectApiKey (keyPrefix, hash)│
│  - TrialUser                     │
│  - ActivationEvent               │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│  lib/intelligence.ts             │
│  journeys() function             │
│                                  │
│  1. Fetch events by project      │
│  2. Group by user                │
│  3. Build canonical journey      │
│  4. Diagnose blockers            │
│  5. Generate customer memory     │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│  Dashboard UI                    │
│  /overview, /journeys           │
│                                  │
│  - Conversion probability        │
│  - At-risk users                 │
│  - Funnel discovery              │
│  - Behavioral clusters           │
│  - User journey timelines        │
└──────────────────────────────────┘
```

---

## 7. Key Files Reference

| File | Purpose |
|------|---------|
| `packages/sdk/src/client.ts` | SDK client (queues, batches, flushes) |
| `packages/sdk/src/auto.ts` | Zero-config auto-tracking entry point |
| `app/api/v1/events/batch/route.ts` | Event ingestion endpoint |
| `lib/event-store.ts` | Database ingestion logic |
| `lib/intelligence.ts` | Journey reconstruction & analysis |
| `lib/keys.ts` | API key generation & validation |
| `lib/customer-memory.ts` | Customer memory capsule generation |
| `lib/predictive-analytics.ts` | Conversion prediction & clustering |
| `prisma/schema.prisma` | Database schema |

---

## 8. Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| 401 Invalid project API key | Key doesn't exist in database | Generate key via Settings or API |
| 402 Plan limit exceeded | Over 10k events/month on Starter | Upgrade to Pro plan |
| CORS errors | Origin not in `SDK_CORS_ORIGINS` | Add your domain to `.env` |
| Events not appearing | Key mismatch or flush interval | Check key, call `flush()` manually |
| Duplicate events | Same event ID sent twice | SDK dedupes automatically |
| Database connection errors | Postgres not running | Start Postgres, check `DATABASE_URL` |

---

## 9. Next Steps for You

1. **Create a valid account** at http://localhost:3000/signup
2. **Generate API key** in Settings
3. **Update `.env`** with the real key
4. **Run installer**: `npx dealmemory install`
5. **Restart your app** to pick up the new key
6. **Test tracking** with a manual API call
7. **Verify events** appear in the dashboard

## 10. Installation Summary

**Super simple 3-step setup**:

```bash
# 1. Install the package
npm install dealmemory

# 2. Run the installer (writes tracking code automatically)
npx dealmemory install

# 3. Set your API key in .env
DEALMEMORY_API_KEY=pk_live_...
```

That's it! DealMemory now tracks everything automatically.

---

## 11. Additional Resources

- [Full Architecture & Roadmap](APP_OVERVIEW_AND_ROADMAP.md)
- [Installation Guide](docs/INSTALLATION.md)
- [SDK Guide](docs/SDK-GUIDE.md)
- [API Reference](docs/API-REFERENCE.md)
- [How DealMemory Works](docs/HOW-DEALMEMORY-WORKS.md)

---

*Generated by Devin for DealMemory troubleshooting*
