export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { error } from '@/lib/api'; export async function POST(){return error('Demo event emission has been removed. Send events through an installed SDK.',410)}
