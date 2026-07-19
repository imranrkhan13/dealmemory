export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { error } from '@/lib/api';

export async function GET() {
  return error('This demo state endpoint has been removed.', 410);
}
