export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { error } from '@/lib/api'; export async function POST(){return error('Seeded demo data has been removed from this product.',410)}
