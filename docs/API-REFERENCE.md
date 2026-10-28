# DealMemory API Reference

All requests to the DealMemory HTTP API use JSON payloads and return JSON responses.

---

## Base URLs

- **Local Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

---

## Authentication

| Type | Header | Scope |
| :--- | :--- | :--- |
| **Project Public Key** | `x-project-key: pk_live_...` | Ingestion API (`/v1/events/batch`) |
| **Session Cookie** | `next-auth.session-token` | Internal Dashboard & Management APIs |
| **Webhook Signature** | `webhook-id`, `webhook-signature`, `webhook-timestamp` | Payment Webhooks (`/api/webhooks/dodo`) |

---

## 1. Event Ingestion API

### Batch Ingest Events

```http
POST /api/v1/events/batch
```

Accepts an array of product milestone events. Enforces atomic idempotency and edge credential sanitization.

#### Request Headers

```http
Content-Type: application/json
x-project-key: pk_live_your_key_here
```

#### Request Body Schema

```json
{
  "events": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "projectKey": "pk_live_your_key_here",
      "name": "trial_started",
      "userId": "usr_10294",
      "anonymousId": "anon_92812",
      "sessionId": "ses_01928",
      "occurredAt": "2026-10-28T12:00:00.000Z",
      "url": "https://app.example.com/welcome",
      "referrer": "https://google.com",
      "properties": {
        "tier": "developer",
        "onboardingSource": "cli"
      }
    }
  ]
}
```

#### Field Specifications

| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `id` | `string` (UUID) | **Yes** | Unique idempotency identifier for the event. |
| `projectKey`| `string` | **Yes** | Must begin with `pk_` and match the `x-project-key` header. |
| `name` | `string` | **Yes** | 1-80 characters. Standardized or custom event name. |
| `userId` | `string` | No | Stable identifier of authenticated user (1-120 chars). |
| `anonymousId` | `string` | No | Anonymous client-side tracking identifier. |
| `sessionId` | `string` | No | Session identifier (1-120 chars). |
| `occurredAt`| `string` (ISO 8601) | **Yes** | Event timestamp in UTC. |
| `url` | `string` | No | Current page URL (must not contain query parameters). |
| `referrer` | `string` | No | Referring page URL. |
| `properties`| `object` | No | Key-value pairs (max 20 keys, scalar values only). |

#### Response Codes

- `200 OK`: All events accepted and persisted.
  ```json
  {
    "accepted": 1,
    "deduplicated": 0,
    "status": "ok"
  }
  ```
- `400 Bad Request`: Validation failure (malformed payload, invalid event timestamp, credential leaked in properties).
- `401 Unauthorized`: Missing or invalid `x-project-key`.
- `409 Conflict`: One or more events in the batch were previously inserted with conflicting payloads.
  ```json
  {
    "error": "Conflict",
    "conflicts": [{ "eventId": "3fa85f64-5717-4562-b3fc-2c963f66afa6" }]
  }
  ```
- `413 Payload Too Large`: Batch exceeds 100 events or request body exceeds 1MB.

---

### Ingestion Status

```http
GET /api/v1/integration-status
```

Checks whether the current workspace has active event ingestion, recent activity, and third-party connector readiness.

#### Response Example

```json
{
  "ok": true,
  "ingestion": "connected",
  "eventCount": 42,
  "latestEvent": "2026-10-28T14:30:00.000Z",
  "supermemory": true,
  "dodo": true
}
```

---

## 2. Project Keys API

### List Workspace Keys

```http
GET /api/keys
```

Returns public `pk_live_...` keys associated with the authenticated user's workspace.

### Create Public Key

```http
POST /api/keys
```

Generates a new public project key for client ingestion.

#### Response Example

```json
{
  "id": "key_clw829s01",
  "key": "pk_live_8f3a92b7c61e4a108d2345",
  "name": "Default Public Key",
  "createdAt": "2026-10-28T10:00:00.000Z"
}
```

---

## 3. Billing & Dodo Payments API

### Create Checkout Session

```http
POST /api/billing/checkout
```

Creates a hosted checkout session with Dodo Payments for upgrading to DealMemory Pro.

#### Response Example

```json
{
  "checkoutUrl": "https://test.dodopayments.com/checkout/sess_83921"
}
```

### Customer Portal Session

```http
POST /api/billing/customer-portal
```

Generates a secure customer portal link where users can manage payment methods and active subscriptions.

#### Response Example

```json
{
  "portalUrl": "https://test.dodopayments.com/portal/cust_01928"
}
```

### Get Subscription Status

```http
GET /api/billing/subscription
```

Returns current subscription tier (`free` or `pro`), renewal date, and billing provider status.

---

## 4. Webhooks API

### Dodo Payments Webhook Receiver

```http
POST /api/webhooks/dodo
```

Receives asynchronous billing webhooks from Dodo Payments. Enforces cryptographic signature verification via `standardwebhooks`.

#### Webhook Headers Required

- `webhook-id`
- `webhook-signature`
- `webhook-timestamp`

#### Supported Events

- `subscription.active`
- `subscription.renewed`
- `subscription.cancelled`
- `subscription.updated`
