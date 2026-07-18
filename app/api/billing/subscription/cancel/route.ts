import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { getDodoClient } from '@/lib/dodo';

export async function POST(req: Request) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Optional body: { cancel_at_period_end?: boolean }
  let cancelAtPeriodEnd = false;
  try {
    const body = (await req.json().catch(() => null)) as { cancel_at_period_end?: boolean } | null;
    if (body?.cancel_at_period_end === true) cancelAtPeriodEnd = true;
  } catch {
    // ignore parse errors, default to immediate cancel
  }

  // Find the latest subscription for this user
  const sub = await prisma.subscription.findFirst({
    where: { userId: session.user.id as string },
    orderBy: { createdAt: 'desc' },
    select: { id: true, dodoSubscriptionId: true, status: true, dodoCustomerId: true, dodoProductId: true, currentPeriodEnd: true },
  });

  if (!sub?.dodoSubscriptionId) {
    return NextResponse.json({ error: 'No active subscription to cancel' }, { status: 404 });
  }

  try {
    const client = getDodoClient();

    if (cancelAtPeriodEnd) {
      await client.subscriptions.update(sub.dodoSubscriptionId, {
        cancel_at_next_billing_date: true,
      } as any);

      // Return current subscription (unchanged locally); webhook will update later
      const current = await prisma.subscription.findUnique({ where: { id: sub.id } });
      return NextResponse.json({ subscription: current, scheduled: true });
    } else {
      await client.subscriptions.update(sub.dodoSubscriptionId, {
        status: 'cancelled',
      } as any);

      // Reflect local status immediately; webhook will confirm
      const updated = await prisma.subscription.update({
        where: { id: sub.id },
        data: { status: 'cancelled' },
      });

      return NextResponse.json({ subscription: updated, scheduled: false });
    }
  } catch (err: any) {
    return NextResponse.json({ error: 'Cancel failed', detail: err?.message ?? String(err) }, { status: 502 });
  }
}