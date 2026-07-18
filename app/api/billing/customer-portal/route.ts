import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { getDodoClient } from '@/lib/dodo';

export async function GET(req: Request) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Find the user's latest subscription
  const sub = await prisma.subscription.findFirst({
    where: { userId: session.user.id as string },
    orderBy: { createdAt: 'desc' },
    select: { dodoCustomerId: true },
  });

  if (!sub) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
  }
  if (!sub.dodoCustomerId) {
    return NextResponse.json({ error: 'No Dodo customer for subscription' }, { status: 400 });
  }

  try {
    const client = getDodoClient();
    const portal = await client.customers.customerPortal.create(sub.dodoCustomerId);
    if (!portal?.link) {
      return NextResponse.json({ error: 'Failed to create customer portal session' }, { status: 502 });
    }
    return NextResponse.json({ url: portal.link });
  } catch (err: any) {
    return NextResponse.json({ error: 'Customer portal error', detail: err?.message ?? String(err) }, { status: 502 });
  }
}