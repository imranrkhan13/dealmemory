export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { ensureDatabaseSchema } from '@/lib/db';
import { journeys } from '@/lib/intelligence';
import { projectScope, scopeError } from '@/lib/project-scope';

export async function GET(req: Request) {
  try {
    await ensureDatabaseSchema();
    const projectId = await projectScope(req);
    if (!projectId) {
      return Response.json({ ok: true, journeys: [] });
    }
    const data = await journeys(projectId);
    return Response.json({ ok: true, journeys: data });
  } catch (e) {
    return scopeError(e);
  }
}
