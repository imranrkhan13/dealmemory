# DealMemory

DealMemory is a project-scoped activation intelligence platform. Install the SDK, send explicit trial events, and inspect real incoming events and journeys in the dashboard. No data is seeded automatically.

## Quick start

```bash
npm install
npm run dev
```

1. Open `/signup` and create a project.
2. Copy its test project key.
3. Install and initialize the SDK:

```ts
import { ActivationMemory } from '@activationmemory/sdk';
const activation = new ActivationMemory({ projectKey: 'pk_test_…', apiUrl: 'http://localhost:3000/api' });
activation.identify(user.id);
activation.track('trial_started');
activation.page('/onboarding');
activation.setGoal('Create my first project');
```

4. Open `/dashboard` to see only events for that project.

## Product model

- `/` is the marketing site.
- `/dashboard` is project-gated and contains real incoming event data.
- `/events` lists every received SDK event.
- `/journeys` reconstructs user paths from ordered events.
- `/settings` exposes project keys and webhook configuration.

Supermemory is optional, server-side customer context for goals, objections, and support outcomes. Dodo is optional, server-side activation-gated checkout; payments are accepted only through signed webhook verification.

## Billing with Dodo Payments

This app integrates Dodo Payments for subscriptions (Free and Pro).

- Pricing page: [`app/pricing/page.tsx`](app/pricing/page.tsx)
- Upgrade button: [`components/upgrade-button.tsx`](components/upgrade-button.tsx)
- API routes:
  - Create Checkout Session: [`app/api/billing/checkout/route.ts`](app/api/billing/checkout/route.ts)
  - Customer Portal: [`app/api/billing/customer-portal/route.ts`](app/api/billing/customer-portal/route.ts)
  - Get Current Subscription: [`app/api/billing/subscription/route.ts`](app/api/billing/subscription/route.ts)
  - Cancel Subscription: [`app/api/billing/subscription/cancel/route.ts`](app/api/billing/subscription/cancel/route.ts)
- Webhook (signature verified + idempotent): [`app/api/webhooks/dodo/route.ts`](app/api/webhooks/dodo/route.ts)
- Helpers for gating:
  - [`lib/billing.ts`](lib/billing.ts) exports [`isProUser()`](lib/billing.ts:10) and [`requirePro()`](lib/billing.ts:28)

### Environment variables

Configure these in `.env` (test mode by default):

- DODO_API_KEY (fallbacks supported: DODOPAYMENTSAPIKEY, DODO_PAYMENTS_API_KEY)
- DODO_WEBHOOK_SECRET (fallbacks supported: DODOWEBHOOKSECRET, DODO_PAYMENTS_WEBHOOK_SECRET)
- DODO_PRODUCT_ID (fallback: DODOPRODUCTID) — Pro product id
- DODO_PRICE_ID (optional, fallback: DODOPRICEID) — if using price-based checkout
- NEXT_PUBLIC_APP_URL — e.g. http://localhost:3000
- DODO_ENVIRONMENT — test_mode (default) or live_mode

Return URL after successful checkout: `${NEXT_PUBLIC_APP_URL}/dashboard/settings`

The Dodo client and env mapping live in [`lib/dodo.ts`](lib/dodo.ts).

### Database mapping

We reuse the existing Prisma Subscription model:

- dodoCustomerId → dodo_customer_id
- dodoSubscriptionId → subscription_id
- status → subscription_status
- dodoProductId → current_plan
- currentPeriodEnd → next_billing_date

Normalization helper: [`normalizeFromPrisma()`](lib/dodo.ts:34).

### Webhook security

- Uses Standard Webhooks headers: `webhook-id`, `webhook-signature`, `webhook-timestamp`
- Verifies raw body with `standardwebhooks`
- Idempotency via `DodoWebhookEvent` table (`eventId` unique)
- Updates/creates `Subscription` for events like:
  - `subscription.active`, `subscription.renewed`, `subscription.cancelled`, `subscription.updated`

Docs references:
- Checkout Sessions: https://docs.dodopayments.com/developer-resources/checkout-session
- Next.js Adaptor (Customer Portal, Webhooks): https://docs.dodopayments.com/developer-resources/nextjs-adaptor
- Customer Portal API: https://docs.dodopayments.com/api-reference/customers/create-customer-portal-session
- Subscription webhooks: https://docs.dodopayments.com/developer-resources/webhooks/intents/subscription
- Webhooks guide and verification: https://docs.dodopayments.com/developer-resources/webhooks

### Protecting premium features

Use the helpers from [`lib/billing.ts`](lib/billing.ts):

- Server/API routes: call [`requirePro(userId)`](lib/billing.ts:28) to enforce Pro.
- Server utilities: call [`isProUser(userId)`](lib/billing.ts:10) to check access.

Examples (pseudo):
- Unlimited AI journeys → guard write-heavy routes with `requirePro`
- Unlimited Supermemory retrieval → guard retrieval endpoint
- Team workspaces / Advanced AI insights / API access → guard respective routes

Note: We intentionally did not add a global `middleware.ts` to avoid breaking existing demo flows. Apply gating where needed.

### Sandbox testing

1) Create a user and sign in (NextAuth credentials).
2) Visit `/pricing` and click Upgrade to Pro.
3) Complete Dodo checkout in test mode.
4) Ensure your webhook endpoint is configured to POST to `/api/webhooks/dodo` with the correct secret.
5) After webhook delivery, open `/settings`:
   - Status should show `active` or `renewed`
   - Manage subscription via “Manage subscription” (Customer Portal)
   - Try Cancel immediately to test `subscription.cancelled`

Troubleshooting:
- Missing checkout URL → verify `DODO_PRODUCT_ID` and API key.
- 401 on webhook → verify `DODO_WEBHOOK_SECRET` and headers.
- Not resolving user on webhook → ensure checkout `metadata.user_id` is set (done by our checkout route).

### Production rollout

- Switch `DODO_ENVIRONMENT=live_mode` and use live API key and product/price IDs.
- Keep using NEXT_PUBLIC_APP_URL with your production domain.
- Monitor webhook deliveries; store `webhook-id` for idempotency (already implemented).
- Ensure PCI compliance: Never handle raw card data; Dodo hosted checkout handles it.
- Add observability on billing routes + webhook (logging, trace ids).
- Rotate webhook secret periodically.

## Privacy

Track only explicit activation events. The SDK filters sensitive property names and does not capture passwords, arbitrary form contents, or session replay data.

## Honest limitations

This prototype uses JSON persistence and local browser project selection; it does not implement production authentication, team roles, or durable secret management. Supermemory and Dodo need environment credentials before their provider requests can be tested.

```bash
npm run lint
npm run typecheck
npm run build
```
