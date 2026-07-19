export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function POST() {
  const { authOptions } = await import('@/lib/nextauth');
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Lazy import prisma and dodo client to avoid build-time evaluation
  const [{ prisma }, dodo] = await Promise.all([
    import('@/lib/db'),
    import('@/lib/dodo'),
  ]);
  const { getDodoClient, getReturnUrl } = dodo as typeof import('@/lib/dodo');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id as string },
    select: { id: true, email: true, name: true },
  });

  if (!user?.email) {
    return NextResponse.json({ error: 'User email required for checkout' }, { status: 400 });
  }

  const productId = process.env.DODO_PRODUCT_ID || process.env.DODOPRODUCTID;
  const priceId = process.env.DODO_PRICE_ID || process.env.DODOPRICEID;

  if (!productId && !priceId) {
    return NextResponse.json({ error: 'Missing DODO_PRODUCT_ID/DODOPRODUCTID or DODO_PRICE_ID/DODOPRICEID' }, { status: 503 });
  }

  try {
    const client = await getDodoClient();

    if (productId) {
      const sessionResp = await client.checkoutSessions.create({
        product_cart: [{ product_id: productId, quantity: 1 }],
        customer: {
          email: user.email,
          name: user.name ?? undefined,
        },
        return_url: getReturnUrl(),
        metadata: {
          user_id: user.id,
        },
      });

      if (!sessionResp?.checkout_url) {
        return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 502 });
      }
      return NextResponse.json({ checkout_url: sessionResp.checkout_url, session_id: sessionResp.session_id });
    }

    const sessionResp = await client.checkoutSessions.create({
      price_id: priceId as string,
      quantity: 1,
      customer: {
        email: user.email,
        name: user.name ?? undefined,
      },
      return_url: getReturnUrl(),
      metadata: {
        user_id: user.id,
      },
    } as any);

    if (!sessionResp?.checkout_url) {
      return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 502 });
    }
    return NextResponse.json({ checkout_url: sessionResp.checkout_url, session_id: sessionResp.session_id });
  } catch (err: any) {
    return NextResponse.json({ error: 'Checkout session error', detail: err?.message ?? String(err) }, { status: 502 });
  }
}