import DodoPayments from 'dodopayments';

export type DodoEnv = 'test_mode' | 'live_mode';

export function getEnvironment(): DodoEnv {
  const env = (process.env.DODO_ENVIRONMENT as DodoEnv) || 'test_mode';
  return env === 'live_mode' ? 'live_mode' : 'test_mode';
}

export function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

export function getReturnUrl(): string {
  // Per requirement: redirect to dashboard settings after checkout
  return `${appUrl()}/dashboard/settings`;
}

export function getDodoClient() {
  const apiKey = process.env.DODO_API_KEY || process.env.DODOPAYMENTSAPIKEY || process.env.DODO_PAYMENTS_API_KEY;
  if (!apiKey) {
    throw new Error('Missing DODO_API_KEY');
  }
  return new DodoPayments({
    bearerToken: apiKey,
    environment: getEnvironment(),
  });
}

export type WebhookHeaders = Record<string, string>;

export function extractWebhookHeaders(h: Headers): WebhookHeaders {
  // Standard Webhooks header names as per Dodo docs
  const id = h.get('webhook-id') || '';
  const sig = h.get('webhook-signature') || '';
  const ts = h.get('webhook-timestamp') || '';
  return {
    'webhook-id': id,
    'webhook-signature': sig,
    'webhook-timestamp': ts,
  };
}

export type NormalizedSubscription = {
  dodo_customer_id: string | null;
  subscription_id: string | null;
  subscription_status: string | null;
  current_plan: string | null; // map to product/price id we track
  next_billing_date: string | null; // ISO string
};

export function normalizeFromPrisma(sub: {
  dodoCustomerId: string | null;
  dodoSubscriptionId: string | null;
  status: string | null;
  dodoProductId: string | null;
  currentPeriodEnd: Date | null;
} | null): NormalizedSubscription | null {
  if (!sub) return null;
  return {
    dodo_customer_id: sub.dodoCustomerId ?? null,
    subscription_id: sub.dodoSubscriptionId ?? null,
    subscription_status: sub.status ?? null,
    current_plan: sub.dodoProductId ?? null,
    next_billing_date: sub.currentPeriodEnd ? sub.currentPeriodEnd.toISOString() : null,
  };
}