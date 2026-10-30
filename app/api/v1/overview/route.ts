export const dynamic = 'force-dynamic';

import { requireAuth } from '@/lib/auth';
import { prisma, ensureDatabaseSchema } from '@/lib/db';
import { ownedProject, projectScope, scopeError } from '@/lib/project-scope';
import { journeys } from '@/lib/intelligence';
import { formatRelativeTime, getReadableEventName } from '@/lib/customer-memory';

export async function GET(req: Request) {
  try {
    await ensureDatabaseSchema();
    const { userId } = await requireAuth();
    const requested = new URL(req.url).searchParams.get('projectId');
    const project = await ownedProject(userId, requested);
    if (requested && !project) {
      return Response.json({ ok: false, error: 'Forbidden' }, { status: 403 });
    }
    const projectId = project?.id ?? null;

    if (!projectId) {
      return Response.json({
        ok: true,
        metrics: {
          documents: 0,
          memories: 0,
          searchRequests: 0,
          namespaces: 0,
          connectors: 0,
        },
        chartData: Array.from({ length: 30 }, (_, i) => ({
          day: i + 1,
          date: '',
          label: '',
          memories: 0,
          searches: 0,
          live: 0,
          total: 0,
          height: 12,
        })),
        namespaces: [],
        recentMemories: [],
        latestSearches: [],
      });
    }

    // 1. Core database counts
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalEvents,
      milestoneEvents,
      connectedUsersCount,
      allOwnerProjects,
      recentEvents,
      userJourneys,
      activeTodayCount,
      existingKey,
    ] = await Promise.all([
      // Total customer profiles (documents)
      prisma.trialUser.count({ where: { projectId } }),
      // Total events (requests)
      prisma.activationEvent.count({ where: { projectId } }),
      // Milestone memories
      prisma.activationEvent.count({
        where: {
          projectId,
          name: {
            in: [
              'first_map_generated',
              'first_value_reached',
              'activation_completed',
              'payment_completed',
              'goal_set',
            ],
          },
        },
      }),
      // Connected connectors
      prisma.trialUser.count({
        where: {
          projectId,
          activationEvents: {
            some: {
              name: {
                in: [
                  'integration_connected',
                  'repository_connected',
                  'githubconnected',
                ],
              },
            },
          },
        },
      }),
      // Namespaces (workspaces owned by this user)
      prisma.project.findMany({
        where: { ownerId: userId },
        include: {
          _count: {
            select: { activationEvents: true, trialUsers: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      // Recent raw events for the live search/events feed
      prisma.activationEvent.findMany({
        where: { projectId },
        include: { trialUser: true },
        orderBy: [{ occurredAt: 'desc' }, { id: 'desc' }],
        take: 12,
      }),
      // Full customer journeys
      journeys(projectId),
      // Active users today
      prisma.trialUser.count({
        where: {
          projectId,
          activationEvents: {
            some: {
              occurredAt: { gte: oneDayAgo },
            },
          },
        },
      }),
      // Active project API key
      prisma.projectApiKey.findFirst({
        where: { projectId, revokedAt: null },
        select: { keyPrefix: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    let keyPrefix = existingKey?.keyPrefix;
    if (!keyPrefix) {
      const { generateProjectKey } = await import('@/lib/keys');
      const generated = await generateProjectKey('pk_live');
      await prisma.projectApiKey.create({
        data: { projectId, keyPrefix: generated.prefix, keyHash: generated.keyHash },
      });
      keyPrefix = generated.prefix;
    }

    // 2. Compute 30-day dynamic chart data
    const eventsLast30Days = await prisma.activationEvent.findMany({
      where: {
        projectId,
        occurredAt: { gte: thirtyDaysAgo },
      },
      select: {
        id: true,
        name: true,
        occurredAt: true,
      },
    });

    const dayBuckets = new Map<string, { memories: number; searches: number; live: number; total: number }>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      dayBuckets.set(key, { memories: 0, searches: 0, live: 0, total: 0 });
    }

    const oneDayAgoMs = now.getTime() - 24 * 60 * 60 * 1000;
    for (const evt of eventsLast30Days) {
      const key = evt.occurredAt.toISOString().slice(0, 10);
      const bucket = dayBuckets.get(key);
      if (bucket) {
        bucket.total += 1;
        if (
          [
            'first_map_generated',
            'first_value_reached',
            'activation_completed',
            'payment_completed',
            'goal_set',
          ].includes(evt.name)
        ) {
          bucket.memories += 1;
        } else {
          bucket.searches += 1;
        }
        if (evt.occurredAt.getTime() >= oneDayAgoMs) {
          bucket.live += 1;
        }
      }
    }

    const chartEntries = Array.from(dayBuckets.entries()).map(([dateStr, data]) => {
      const d = new Date(dateStr);
      return {
        date: dateStr,
        label: d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
        memories: data.memories,
        searches: data.searches,
        live: data.live,
        total: data.total,
      };
    });

    const maxTotal = Math.max(...chartEntries.map((c) => c.total), 1);
    const chartData = chartEntries.map((c, i) => {
      // Scale height between 16px and 120px
      const height = c.total === 0 ? 16 : Math.round(16 + (c.total / maxTotal) * 104);
      return {
        day: i + 1,
        ...c,
        height,
      };
    });

    // 3. Namespaces breakdown
    const namespaces = allOwnerProjects.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      eventsCount: p._count.activationEvents,
      usersCount: p._count.trialUsers,
    }));

    // 4. Synthesized Recent Customer Memories & User Stories
    const stalledCount = userJourneys.filter(
      (j) => j.onboardingDiagnosis?.isBroke || Boolean(j.blocker)
    ).length;

    const userStories = userJourneys
      .filter((j) => j.lastAction)
      .slice(0, 8)
      .map((j) => {
        const last = j.lastAction!;
        const actSummary = j.customerMemory?.activitySummary;
        const projName =
          allOwnerProjects.find((p) => p.id === projectId)?.slug ?? 'dm_project_default';

        return {
          id: j.userId,
          userId: j.userId,
          cleanName: j.userId.replace(/^(user_|usr_)/, ''),
          title: j.customerMemory?.title ?? last.readableName,
          summary: j.customerMemory?.summary ?? last.narrative,
          story: actSummary?.executiveStory ?? j.customerMemory?.summary ?? last.narrative,
          loved: actSummary?.lovedFeature ?? 'Engaged with application features',
          timeSpent: actSummary?.totalTimeSpent ?? '< 1 min',
          activeWindow: actSummary?.activeTimeWindow ?? 'recently',
          lastAction: last.readableName,
          namespace: projName,
          state: j.state,
          isBroke: j.onboardingDiagnosis?.isBroke ?? false,
          brokeReason: j.onboardingDiagnosis?.brokeAt ?? null,
          archetype: j.onboardingDiagnosis?.archetype ?? 'general',
          timeAgo: last.relativeTime,
          occurredAt: last.occurredAt,
        };
      });

    const recentMemories = userStories.slice(0, 5);

    // 5. Recent Requests / Searches feed
    const latestSearches = recentEvents.map((e) => {
      // Deterministic latency simulation: ~140ms - 220ms
      const hashNum = Array.from(e.id).reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const latencyMs = 135 + (hashNum % 90);

      const propsStr = Object.entries(JSON.parse(e.properties ?? '{}'))
        .slice(0, 2)
        .map(([k, v]) => `${k}=${v}`)
        .join(' ');

      return {
        id: e.id,
        query: `${getReadableEventName(e.name)}: ${e.trialUser.externalUserId}${propsStr ? ` (${propsStr})` : ''}`,
        name: e.name,
        user: e.trialUser.externalUserId,
        timeAgo: formatRelativeTime(e.occurredAt.toISOString()),
        occurredAt: e.occurredAt.toISOString(),
        latencyMs,
      };
    });

    return Response.json({
      ok: true,
      apiKeyPrefix: keyPrefix,
      metrics: {
        // Simple founder metrics
        trackedUsers: totalUsers,
        totalEvents,
        stalledUsers: stalledCount,
        activeToday: activeTodayCount,
        // Legacy keys preserved
        documents: totalUsers,
        memories: milestoneEvents || recentMemories.length,
        searchRequests: totalEvents,
        namespaces: allOwnerProjects.length,
        connectors: connectedUsersCount,
      },
      chartData,
      namespaces,
      recentMemories,
      userStories,
      latestSearches,
    });
  } catch (e) {
    return scopeError(e);
  }
}
