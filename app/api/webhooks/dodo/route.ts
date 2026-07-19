export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { Webhook } from 'standardwebhooks';
import { prisma } from '@/lib/db';

/**
 * Dodo Payments webhook handler
 * - Verifies signature using Standard Webhooks headers
 * - Ensures idempotency using webhook-id header (stored in DodoWebhookEvent)
 * - Syncs subscription state into Prisma Subscription model
 *
 * Expected env:
 * - DODO_WEBHOOK_SECRET
 */
export async function POST(req: Request) {
  const secret = process.env.DODO_WEBHOOK_SECRET || process.env.DODOWEBHOOKSECRET || process.env.DODO_PAYMENTS_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Missing DODO_WEBHOOK_SECRET' }, { status: 503 });
  }

  const webhookId = req.headers.get('webhook-id') || '';
  const webhookSignature = req.headers.get('webhook-signature') || '';
  const webhookTimestamp = req.headers.get('webhook-timestamp') || '';

  if (!webhookId || !webhookSignature || !webhookTimestamp) {
    return NextResponse.json({ error: 'Missing webhook headers' }, { status: 400 });
  }

  // Read raw body for signature verification
  const raw = await req.text();

  // Verify signature
  try {
    const wh = new Webhook(secret);
    await wh.verify(raw, {
      'webhook-id': webhookId,
      'webhook-signature': webhookSignature,
      'webhook-timestamp': webhookTimestamp,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // Idempotency: store event id, skip if already processed
  const payload = JSON.parse(raw) as any;
  try {
    await prisma.dodoWebhookEvent.create({
      data: {
        eventId: webhookId,
        payload: raw,
      },
    });
  } catch (e: any) {
    // Unique constraint means we already processed this
    return NextResponse.json({ received: true, duplicate: true });
  }

  // Process relevant events
  try {
    const type: string = payload?.type || '';
    const data: any = payload?.data || {};

    // Some events (e.g., payment.succeeded) may nest subscription under data.subscription
    const subData: any = {
      ...(typeof data === 'object' ? data : {}),
      ...(typeof data?.subscription === 'object' ? data.subscription : {}),
    };

    // Normalize subscription-like shape from payload
    const subscriptionId: string | null =
      subData.subscription_id ?? subData.id ?? null;

    const customerId: string | null =
      subData.customer_id ?? subData.customerId ?? subData.customer?.id ?? data?.customer_id ?? null;

    const statusRaw: string | null = subData.status ?? null;

    const nextBillingStr: string | null =
      subData.next_billing_date ?? subData.current_period_end ?? null;

    const productId: string | null =
      subData.product_id ??
      subData.price_id ??
      subData.product?.id ??
      (Array.isArray(subData.items) && subData.items.length
        ? subData.items[0]?.price_id ?? subData.items[0]?.product_id
        : null) ??
      null;

    const email: string | null =
      subData.customer_email ??
      subData.email ??
      subData.customer?.email ??
      data?.customer_email ??
      data?.email ??
      data?.customer?.email ??
      null;

    // Derive status if missing, based on event type
    let status: string | null = statusRaw;
    if (!status) {
      if (type === 'subscription.active' || type === 'subscription.renewed') status = 'active';
      if (type === 'subscription.cancelled') status = 'cancelled';
      if (type === 'subscription.on_hold') status = 'on_hold';
      if (type === 'subscription.updated' && subData.status) status = String(subData.status);
    }

    // Try to resolve userId to attach subscription
    // 1) metadata.user_id from payload (prefer nested subscription metadata, then root)
    let userId: string | null =
      (subData.metadata && (subData.metadata.user_id as string)) ||
      (data.metadata && (data.metadata.user_id as string)) ||
      null;

    // 2) If not present, locate existing subscription by customer id
    if (!userId && customerId) {
      const existing = await prisma.subscription.findFirst({
        where: { dodoCustomerId: customerId },
        orderBy: { createdAt: 'desc' },
        select: { userId: true },
      });
      if (existing?.userId) userId = existing.userId;
    }

    // 3) If still unknown, try resolve by email
    if (!userId && email) {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });
      if (user?.id) userId = user.id;
    }

    // If we cannot resolve a user, acknowledge and stop (idempotent log already stored)
    if (!userId) {
      await prisma.dodoWebhookEvent.update({
        where: { eventId: webhookId },
        data: { processedAt: new Date() },
      });
      return NextResponse.json({ received: true, unresolved_user: true }, { status: 202 });
    }

    // Upsert subscription record
    const now = new Date();
    const nextBilling = nextBillingStr ? new Date(nextBillingStr) : null;

    // Prefer updating by dodoSubscriptionId if known; else use latest by user
    let record = null;
    if (subscriptionId) {
      record = await prisma.subscription.findFirst({
        where: { dodoSubscriptionId: subscriptionId },
        orderBy: { createdAt: 'desc' },
      });
    }
    if (!record) {
      record = await prisma.subscription.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (record) {
      await prisma.subscription.update({
        where: { id: record.id },
        data: {
          userId,
          dodoCustomerId: customerId ?? record.dodoCustomerId,
          dodoSubscriptionId: subscriptionId ?? record.dodoSubscriptionId,
          dodoProductId: productId ?? record.dodoProductId,
          status: status ?? record.status,
          currentPeriodEnd: nextBilling ?? record.currentPeriodEnd,
        },
      });
    } else {
      await prisma.subscription.create({
        data: {
          userId,
          dodoCustomerId: customerId,
          dodoSubscriptionId: subscriptionId,
          dodoProductId: productId,
          status: status ?? 'active',
          currentPeriodEnd: nextBilling,
          createdAt: now,
        },
      });
    }

    await prisma.dodoWebhookEvent.update({
      where: { eventId: webhookId },
      data: { processedAt: new Date() },
    });

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json({ error: 'Webhook processing error', detail: err?.message ?? String(err) }, { status: 500 });
  }
}
