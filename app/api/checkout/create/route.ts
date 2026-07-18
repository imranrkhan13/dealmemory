import { error } from '@/lib/api';

/**
 * Deprecated demo endpoint.
 * Use authenticated billing endpoint instead: POST /api/billing/checkout
 */
export async function POST() {
  return error('Deprecated: use /api/billing/checkout', 410);
}
