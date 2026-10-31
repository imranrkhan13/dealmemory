export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function GET() {
  const { authOptions } = await import('@/lib/nextauth');
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [{ prisma }, dodo, billing] = await Promise.all([
    import('@/lib/db'),
    import('@/lib/dodo'),
    import('@/lib/billing'),
  ]);
  const { normalizeFromPrisma } = dodo as typeof import('@/lib/dodo');
  const { getPlanState } = billing as typeof import('@/lib/billing');

  const userId = session.user.id as string;

  const [sub, plan] = await Promise.all([
    prisma.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        dodoCustomerId: true,
        dodoSubscriptionId: true,
        status: true,
        dodoProductId: true,
        currentPeriodEnd: true,
      },
    }),
    getPlanState(userId),
  ]);

  const normalized = normalizeFromPrisma(sub as any);
  return NextResponse.json({ subscription: normalized, plan });
}