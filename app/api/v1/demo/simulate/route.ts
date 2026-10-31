export const dynamic = 'force-dynamic';

import { requireAuth } from '@/lib/auth';
import { ownedProject, scopeError } from '@/lib/project-scope';
import { ingest } from '@/lib/event-store';
import { eventQuotaExceeded, getProjectPlanState } from '@/lib/billing';
import type { ActivationEvent } from '@/packages/shared/src/events';

export async function POST(req: Request) {
  try {
    const { userId } = await requireAuth();
    const url = new URL(req.url);
    const requested = url.searchParams.get('projectId');
    const project = await ownedProject(userId, requested);
    if (!project) {
      return Response.json({ ok: false, error: 'Project not found' }, { status: 404 });
    }

    const plan = await getProjectPlanState(project.id);
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

    const body = await req.json().catch(() => ({}));
    const isSingleTest = body.mode === 'single' || body.mode === 'test';
    const sampleUserId = body.userId || (isSingleTest ? `usr_test_${Math.floor(100 + Math.random() * 900)}` : `user_sarah_${Math.floor(100 + Math.random() * 900)}`);
    const sessionId = `ses_${crypto.randomUUID().slice(0, 8)}`;
    const baseTime = isSingleTest ? Date.now() : Date.now() - 35 * 60 * 1000; // right now or 35 mins ago

    const events: ActivationEvent[] = isSingleTest
      ? [
          {
            id: crypto.randomUUID(),
            projectKey: '',
            name: 'setup_verified_event',
            userId: sampleUserId,
            anonymousId: sampleUserId,
            sessionId,
            occurredAt: new Date(baseTime).toISOString(),
            properties: {
              source: 'Quickstart Setup Test',
              status: 'success',
              latencyMs: 142,
              feature: 'Event Ingestion',
            },
          },
        ]
      : [
          {
            id: crypto.randomUUID(),
            projectKey: '',
            name: 'trial_started',
            userId: sampleUserId,
            anonymousId: sampleUserId,
            sessionId,
            occurredAt: new Date(baseTime).toISOString(),
            properties: {
              plan: 'pro_trial',
              source: 'landing_page',
              company: 'Acme Software',
              role: 'Tech Lead',
            },
          },
          {
            id: crypto.randomUUID(),
            projectKey: '',
            name: 'goal_set',
            userId: sampleUserId,
            anonymousId: sampleUserId,
            sessionId,
            occurredAt: new Date(baseTime + 3 * 60 * 1000).toISOString(),
            properties: {
              goal: 'Map repository architecture and identify activation drop-offs',
            },
          },
          {
            id: crypto.randomUUID(),
            projectKey: '',
            name: 'dashboard_opened',
            userId: sampleUserId,
            anonymousId: sampleUserId,
            sessionId,
            occurredAt: new Date(baseTime + 5 * 60 * 1000).toISOString(),
            properties: {
              page: '/overview',
            },
          },
          {
            id: crypto.randomUUID(),
            projectKey: '',
            name: 'project_created',
            userId: sampleUserId,
            anonymousId: sampleUserId,
            sessionId,
            occurredAt: new Date(baseTime + 9 * 60 * 1000).toISOString(),
            properties: {
              name: 'Core Agent Platform',
              stack: 'Next.js, Python, PostgreSQL',
            },
          },
          {
            id: crypto.randomUUID(),
            projectKey: '',
            name: 'integration_connect_attempted',
            userId: sampleUserId,
            anonymousId: sampleUserId,
            sessionId,
            occurredAt: new Date(baseTime + 14 * 60 * 1000).toISOString(),
            properties: {
              provider: 'github',
              repository: 'acme/core-agent',
            },
          },
          {
            id: crypto.randomUUID(),
            projectKey: '',
            name: 'integration_connection_failed',
            userId: sampleUserId,
            anonymousId: sampleUserId,
            sessionId,
            occurredAt: new Date(baseTime + 16 * 60 * 1000).toISOString(),
            properties: {
              provider: 'github',
              errorCode: 'oauth_callback_failed',
              errorMessage: 'GitHub organization requires third-party application owner authorization',
            },
          },
        ];

    const result = await ingest(project.id, events);
    return Response.json({
      ok: true,
      simulatedUser: sampleUserId,
      eventsIngested: result.accepted,
    });
  } catch (e) {
    return scopeError(e);
  }
}
