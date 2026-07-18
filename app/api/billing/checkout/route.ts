import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { getDodoClient, getReturnUrl } from '@/lib/dodo';

export async function POST() {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
    const client = getDodoClient();

    // Prefer product_cart with product_id (per official docs)
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

    // Fallback: if only priceId is present and supported by your product configuration
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