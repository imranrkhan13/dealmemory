import { error } from '@/lib/api';

export async function GET() {
  return error('This demo endpoint has been removed.', 410);
}
