export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { prisma } from '@/lib/db';
import { ingest } from '@/lib/event-store';
import { journeys } from '@/lib/intelligence';
import { getProjectPlanState, eventQuotaExceeded } from '@/lib/billing';
import type { ActivationEvent } from '@/packages/shared/src/events';

export async function POST() {
  // Public demo quickstart seed: uses the caller's owned project if authenticated,
  // otherwise falls back to the first project so the page can show a real journey.
  let projectId: string | null = null;

  try {
    const { prisma: p } = await import('@/lib/db');
    const firstProject = await p.project.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });
    projectId = firstProject?.id ?? null;
  } catch {
    projectId = null;
  }

  if (!projectId) {
    return Response.json({ ok: false, error: 'No project available for the demo seed.' }, { status: 500 });
  }

  const plan = await getProjectPlanState(projectId);
  if (plan && eventQuotaExceeded(plan)) {
    return Response.json(
      {
        ok: false,
        code: 'plan_limit_exceeded',
        error: `The Starter plan includes ${plan.limits.monthlyEvents} events per month. Upgrade to Growth Pro for unlimited ingestion.`,
        limit: plan.limits.monthlyEvents,
        usage: plan.usage.eventsThisMonth,
      },
      { status: 402 }
    );
  }

  const userId = `qs_${Math.floor(1000 + Math.random() * 9000)}`;
  const email = `sarah@acme.inc`;
  const sessionId = `ses_${crypto.randomUUID().slice(0, 8)}`;
  const baseTime = Date.now() - 35 * 60 * 1000;

  const events: ActivationEvent[] = [
    {
      id: crypto.randomUUID(),
      projectKey: '',
      name: 'trial_started',
      userId,
      anonymousId: userId,
      sessionId,
      occurredAt: new Date(baseTime).toISOString(),        properties: { plan: 'pro_trial', source: 'landing_page', company: 'Acme Software', role: 'Tech Lead' } as const,
    },
    {
      id: crypto.randomUUID(),
      projectKey: '',
      name: 'goal_set',
      userId,
      anonymousId: userId,
      sessionId,
      occurredAt: new Date(baseTime + 3 * 60 * 1000).toISOString(),
      properties: { goal: 'Map repository architecture and identify activation drop-offs' } as const,
    },
    {
      id: crypto.randomUUID(),
      projectKey: '',
      name: 'dashboard_opened',
      userId,
      anonymousId: userId,
      sessionId,
      occurredAt: new Date(baseTime + 5 * 60 * 1000).toISOString(),
      properties: { page: '/overview' } as const,
    },
    {
      id: crypto.randomUUID(),
      projectKey: '',
      name: 'project_created',
      userId,
      anonymousId: userId,
      sessionId,
      occurredAt: new Date(baseTime + 9 * 60 * 1000).toISOString(),
      properties: { name: 'Core Agent Platform', stack: 'Next.js, Python, PostgreSQL' } as const,
    },
    {
      id: crypto.randomUUID(),
      projectKey: '',
      name: 'integration_connect_attempted',
      userId,
      anonymousId: userId,
      sessionId,
      occurredAt: new Date(baseTime + 14 * 60 * 1000).toISOString(),
      properties: { provider: 'github', repository: 'acme/core-agent' } as const,
    },
    {
      id: crypto.randomUUID(),
      projectKey: '',
      name: 'integration_connection_failed',
      userId,
      anonymousId: userId,
      sessionId,
      occurredAt: new Date(baseTime + 16 * 60 * 1000).toISOString(),
      properties: {
        provider: 'github',
        errorCode: 'oauth_callback_failed',
        errorMessage: 'GitHub organization requires third-party application owner authorization',
      } as const,
    },
  ];

  await prisma.trialUser.upsert({
    where: { projectId_externalUserId: { projectId, externalUserId: userId } },
    update: { email },
    create: { projectId, externalUserId: userId, email },
  });

  await ingest(projectId, events);

  const data = await journeys(projectId);
  const found = data.find((j) => j.userId === userId);

  return Response.json({
    ok: true,
    userId,
    email,
    eventsIngested: events.length,
    user: found
      ? {
          userId: found.userId,
          email: found.email,
          goal: found.goal ?? undefined,
          blocker: found.blocker ?? undefined,
          lastAction: found.lastAction
            ? { name: found.lastAction.name, readableName: found.lastAction.readableName }
            : undefined,
          status: found.state,
        }
      : undefined,
  });
}
