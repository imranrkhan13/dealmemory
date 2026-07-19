export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { error } from '@/lib/api';

export async function POST() {
  return error('This demo reset endpoint has been removed.', 410);
}
