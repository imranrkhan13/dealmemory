import { error } from '@/lib/api';

/**
 * Deprecated demo endpoint that modified a local store.json and simulated GitHub connect.
 * This path has been removed in the secure multi-tenant model.
 */
export async function POST() {
  return error('This demo endpoint has been removed.', 410);
}
