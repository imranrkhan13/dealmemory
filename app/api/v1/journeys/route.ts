import { NextRequest } from 'next/server';
import { journeys } from '@/lib/intelligence';
import { ok, error } from '@/lib/api';

export async function GET(req: NextRequest) {
  try {
    const projectKey = new URL(req.url).searchParams.get('projectKey') ?? undefined;
    const data = await journeys(projectKey);
    return ok({ journeys: data });
  } catch (e) {
    return error(e instanceof Error ? e.message : 'Failed to load journeys', 500);
  }
}
