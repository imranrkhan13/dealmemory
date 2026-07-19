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

  const [{ prisma }, dodo] = await Promise.all([
    import('@/lib/db'),
    import('@/lib/dodo'),
  ]);
  const { normalizeFromPrisma } = dodo as typeof import('@/lib/dodo');

  const sub = await prisma.subscription.findFirst({
    where: { userId: session.user.id as string },
    orderBy: { createdAt: 'desc' },
    select: {
      dodoCustomerId: true,
      dodoSubscriptionId: true,
      status: true,
      dodoProductId: true,
      currentPeriodEnd: true,
    },
  });

  const normalized = normalizeFromPrisma(sub as any);
  return NextResponse.json({ subscription: normalized });
}