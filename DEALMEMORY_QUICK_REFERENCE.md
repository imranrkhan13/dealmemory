# DealMemory Quick Reference Card

## 🚨 Your Current Issue

**Problem**: Events not tracking because your API key (`pk_live_test123456789abcdef`) doesn't exist in the database.

**Fix**: Sign up at http://localhost:3000/signup → Generate key in Settings → Update `.env` → Restart app

---

## 📊 Data Flow

```
User Action → SDK (queue/batch) → API (/api/v1/events/batch) → PostgreSQL → Journey Analysis → Dashboard
```

---

## 🔑 Required Setup

1. **Install SDK**: `npm install dealmemory`
2. **Run installer**: `npx dealmemory install` (writes tracking code automatically)
3. **Set environment variable**: `DEALMEMORY_API_KEY=pk_live_...` (from Settings)
4. **Import**: `import 'dealmemory/auto'` (zero-config tracking)

---

## 📡 API Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/v1/events/batch` | POST | Project key | Ingest events |
| `/api/v1/events/recent` | GET | Session | Recent events |
| `/api/v1/journeys` | GET | Session | User journeys |
| `/api/v1/overview` | GET | Session | Dashboard data |
| `/api/v1/analytics/predict` | GET | Session | Predictive analytics |
| `/api/v1/ai/ask` | GET | Session | AI copilot |

---

## 🎯 Events to Track

### Automatic (via `dealmemory/auto`) - Everything tracked!
- `page_view` - Page loads
- `action_clicked` - All button/link clicks with text
- `form_submitted` - All form submissions
- `scroll_depth` - Scroll progress (25%, 50%, 75%, 90%, 100%)
- `input_changed` - Input changes (debounced, no sensitive data)
- `error_occurred` - JavaScript errors
- `time_on_page` - Time spent on page

### Manual Milestones
```typescript
dm.trialStarted()
dm.checkoutStarted()
dm.checkoutCompleted()
dm.integrationConnected({provider: 'github'})
dm.integrationFailed({errorCode: 'auth_timeout'})
dm.featureUsed('export_pdf')
dm.firstValueReached()
dm.subscriptionCreated()
dm.subscriptionCancelled()
dm.apiError({status: 500})
dm.teamInvited()
```

### Custom
```typescript
dm.track('custom_event', { property: 'value' })
```

---

## 🔍 Tracking Test

```bash
curl -X POST 'http://localhost:3000/api/v1/events/batch' \
  -H 'Content-Type: application/json' \
  -H 'x-project-key: YOUR_REAL_KEY' \
  -d '{
    "events": [{
      "id": "test-001",
      "projectKey": "YOUR_REAL_KEY",
      "name": "test_event",
      "userId": "user_001",
      "anonymousId": "anon_001",
      "sessionId": "sess_001",
      "occurredAt": "2026-11-04T12:00:00Z",
      "properties": {"test": true}
    }]
  }'
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `packages/sdk/src/client.ts` | SDK implementation |
| `app/api/v1/events/batch/route.ts` | Ingestion endpoint |
| `lib/event-store.ts` | Database ingestion |
| `lib/intelligence.ts` | Journey analysis |
| `lib/keys.ts` | Key validation |

---

## 🛠️ Common Fixes

| Issue | Fix |
|-------|-----|
| 401 Invalid key | Generate real key in Settings |
| 402 Plan limit | Upgrade to Pro |
| CORS errors | Add origin to `SDK_CORS_ORIGINS` |
| No events | Check key, call `flush()` |
| DB errors | Check Postgres, verify `DATABASE_URL` |

---

## 📊 What Gets Tracked

✅ Event names, timestamps, user IDs
✅ Custom properties (sanitized)
✅ Page URLs (query params stripped)
✅ Referrers (query params stripped)
✅ Click actions, form submissions

❌ Passwords, tokens, secrets
❌ Keystrokes, form values
❌ Screen recordings
❌ Query parameters (in URLs)

---

## 🎨 Dashboard Views

- `/overview` - Live metrics, conversion scores
- `/journeys` - User timelines, blockers
- `/events` - Raw event inspector
- `/settings` - API keys, billing

---

*See [DEALMEMORY_TRACKING_GUIDE.md](DEALMEMORY_TRACKING_GUIDE.md) for full documentation*
