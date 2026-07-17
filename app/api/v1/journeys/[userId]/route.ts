import { NextRequest } from 'next/server';
import { blocker, inactiveHours, journeys, recommendation, state } from '@/lib/intelligence';
import { ok, error } from '@/lib/api';

export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const all = await journeys();
    const journey = all.find((j) => j.userId === params.userId);

    if (!journey) {
      return error('Journey not found', 404);
    }

    return ok({
      journey,
      state: state(journey),
      blocker: blocker(journey),
      recommendation: recommendation(journey),
      inactiveHours: inactiveHours(journey),
    });
  } catch (e) {
    return error(e instanceof Error ? e.message : 'Failed to load journey', 500);
  }
}
