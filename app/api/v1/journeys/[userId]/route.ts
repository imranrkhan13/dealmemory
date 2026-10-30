export const dynamic = 'force-dynamic';
import { journeys } from '@/lib/intelligence';
import { projectScope, scopeError } from '@/lib/project-scope';
import { prisma } from '@/lib/db';

export async function GET(req: Request, { params }: { params: { userId: string } }) {
  try {
    const projectId = await projectScope(req);
    const journey = projectId ? (await journeys(projectId)).find((j) => j.userId === params.userId) : null;
    return journey
      ? Response.json({
          ok: true,
          journey,
          state: journey.state,
          blocker: journey.blocker,
          recommendation: journey.recommendation,
          inactiveHours: journey.inactiveHours,
          lastAction: journey.lastAction,
          onboardingDiagnosis: journey.onboardingDiagnosis,
          timeline: journey.timeline,
          customerMemory: journey.customerMemory,
        })
      : Response.json({ ok: false, error: 'Journey not found' }, { status: 404 });
  } catch (e) {
    return scopeError(e);
  }
}

export async function POST(req: Request, { params }: { params: { userId: string } }) {
  try {
    const projectId = await projectScope(req);
    if (!projectId) return Response.json({ ok: false, error: 'Project not found' }, { status: 404 });

    const body = await req.json();
    const notes = typeof body?.notes === 'string' ? body.notes.trim() : '';

    const trialUser = await prisma.trialUser.findUnique({
      where: {
        projectId_externalUserId: {
          projectId,
          externalUserId: params.userId,
        },
      },
    });

    if (!trialUser) {
      return Response.json({ ok: false, error: 'User record not found' }, { status: 404 });
    }

    let existing: Record<string, unknown> = {};
    try {
      if (trialUser.attributes) existing = JSON.parse(trialUser.attributes);
    } catch {}

    const updated = await prisma.trialUser.update({
      where: { id: trialUser.id },
      data: {
        attributes: JSON.stringify({
          ...existing,
          notes,
          notesUpdatedAt: new Date().toISOString(),
        }),
      },
    });

    return Response.json({ ok: true, attributes: updated.attributes });
  } catch (e) {
    return scopeError(e);
  }
}
