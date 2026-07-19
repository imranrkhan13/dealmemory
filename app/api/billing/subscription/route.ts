import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import { prisma } from '@/lib/db';
import { normalizeFromPrisma } from '@/lib/dodo';

export async function GET() {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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