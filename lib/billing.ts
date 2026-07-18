import { prisma } from '@/lib/db';

export type ProStatus = {
  isPro: boolean;
  reason?: string;
};

const PRO_STATUSES = new Set<string>(['active', 'renewed']);

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