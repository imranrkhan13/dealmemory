import { error } from '@/lib/api';

/**
 * Deprecated demo endpoint that used local store.json.
 * This functionality has been removed in favor of authenticated, real data flows.
 */
export async function POST() {
  return error('This demo endpoint has been removed.', 410);
}
