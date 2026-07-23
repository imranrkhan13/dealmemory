export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { activationEventSchema } from "@/packages/shared/src/events";
import { ingest } from "@/lib/intelligence";
import { resolveProjectByRawKey } from "@/lib/keys";
import { error, ok } from "@/lib/api";

const schema = z.object({
    events: z.array(activationEventSchema).min(1).max(100),
});

const localOrigins = new Set([
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
]);

function corsHeaders(req?: NextRequest) {
  const configured = (process.env.SDK_CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const allowed = new Set([...Array.from(localOrigins), ...configured]);
  const origin = req?.headers.get('origin') ?? '';

  return {
    ...(origin && allowed.has(origin) ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {}),
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-project-key',
  };
}

export async function OPTIONS(req: NextRequest) {
    return new NextResponse(null, {
        status: 200,
        headers: corsHeaders(req),
    });
}

export async function POST(req: NextRequest) {
  const rawKey = req.headers.get("x-project-key");
  const body = schema.safeParse(await req.json().catch(() => null));

  const resolved = rawKey ? await resolveProjectByRawKey(rawKey) : null;
  if (!rawKey || !resolved || !resolved.keyPrefix.startsWith('pk_')) {
    const res = error("Invalid project API key.", 401);
    Object.entries(corsHeaders(req)).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  }

  if (!body.success) {
    const res = error(body.error.issues[0].message);
    Object.entries(corsHeaders(req)).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  }

  if (body.data.events.some((e) => e.projectKey !== rawKey)) {
    const res = error("Project key does not match event tenant.", 403);
    Object.entries(corsHeaders(req)).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  }

  const res = ok(await ingest(body.data.events));
  Object.entries(corsHeaders(req)).forEach(([k, v]) => res.headers.set(k, v));
  return res;
}
