import { prisma } from '@/lib/db';

export type ProStatus = {
  isPro: boolean;
  reason?: string;
};

const PRO_STATUSES = new Set<string>(['active', 'renewed']);

export type PlanId = 'starter' | 'pro';

/**
 * Null means unlimited.
 */
export type PlanLimits = {
  projects: number | null;
  monthlyEvents: number | null;
};

export const STARTER_LIMITS: PlanLimits = { projects: 1, monthlyEvents: 10_000 };
export const PRO_LIMITS: PlanLimits = { projects: null, monthlyEvents: null };

export type PlanUsage = {
  projects: number;
  eventsThisMonth: number;
};

export type PlanState = {
  plan: PlanId;
  isPro: boolean;
  reason?: string;
  status: string | null;
  currentPeriodEnd: string | null;
  limits: PlanLimits;
  usage: PlanUsage;
};

function currentMonthStart(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

/**
 * Determine if a user has an active Pro subscription.
 */
export async function isProUser(userId: string): Promise<ProStatus> {
  if (!userId) return { isPro: false, reason: 'missing_user' };

  const sub = await prisma.subscription.findFirst({
    where: { userId, status: { in: Array.from(PRO_STATUSES) } },
    orderBy: { createdAt: 'desc' },
  });

  if (!sub) return { isPro: false, reason: 'no_subscription' };

  // If we have a period end date, ensure current time is before it
  if (sub.currentPeriodEnd && sub.currentPeriodEnd.getTime() <= Date.now()) {
    return { isPro: false, reason: 'expired' };
  }

  return { isPro: true };
}

/**
 * Full plan picture for a user: tier, enforced limits and current usage.
 */
export async function getPlanState(userId: string): Promise<PlanState> {
  const [pro, latest, projects, eventsThisMonth] = await Promise.all([
    isProUser(userId),
    prisma.subscription.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    prisma.project.count({ where: { ownerId: userId } }),
    prisma.activationEvent.count({
      where: { project: { ownerId: userId }, receivedAt: { gte: currentMonthStart() } },
    }),
  ]);

  return {
    plan: pro.isPro ? 'pro' : 'starter',
    isPro: pro.isPro,
    ...(pro.reason ? { reason: pro.reason } : {}),
    status: latest?.status ?? null,
    currentPeriodEnd: latest?.currentPeriodEnd ? latest.currentPeriodEnd.toISOString() : null,
    limits: pro.isPro ? PRO_LIMITS : STARTER_LIMITS,
    usage: { projects, eventsThisMonth },
  };
}

/**
 * Plan state for the owner of a project (used by key-authenticated ingest).
 */
export async function getProjectPlanState(projectId: string): Promise<PlanState | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });
  if (!project) return null;
  return getPlanState(project.ownerId);
}

export function projectLimitReached(plan: PlanState) {
  const limit = plan.limits.projects;
  return limit !== null && plan.usage.projects >= limit;
}

export function eventQuotaExceeded(plan: PlanState) {
  const limit = plan.limits.monthlyEvents;
  return limit !== null && plan.usage.eventsThisMonth >= limit;
}

/**
 * Throw if the user is not Pro. Use inside API routes or server components.
 */
export async function requirePro(userId: string): Promise<void> {
  const { isPro, reason } = await isProUser(userId);
  if (!isPro) {
    const e = new Error('Pro subscription required');
    (e as any).statusCode = 403;
    (e as any).reason = reason;
    throw e;
  }
}

/**
 * Get the most recent subscription for a user.
 */
export async function getCurrentSubscription(userId: string) {
  return prisma.subscription.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}
