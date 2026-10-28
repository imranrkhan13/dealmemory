export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { activationEventSchema } from "@/packages/shared/src/events";
import { ingest } from "@/lib/intelligence";
import { resolveProjectByRawKey } from "@/lib/keys";


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
  const requestId = crypto.randomUUID();
  const respond = (body: unknown, status: number) => NextResponse.json(body, {status,headers:corsHeaders(req)});
  try {
    // Stream with a byte cap: Content-Length is untrusted and may be absent.
    if (Number(req.headers.get('content-length')) > 262144) return respond({ok:false,error:'body_too_large'},413);
    const reader=req.body?.getReader();
    const chunks: Uint8Array[]=[]; let bytes=0;
    if (reader) while(true) {
      const part=await reader.read(); if(part.done) break;
      bytes+=part.value.byteLength;
      if(bytes>262144) { await reader.cancel(); return respond({ok:false,error:'body_too_large'},413); }
      chunks.push(part.value);
    }
    let value:unknown;
    try { value=JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { return respond({ok:false,error:'invalid_json'},400); }
    const body=schema.safeParse(value);
    if(!body.success) return respond({ok:false,error:body.error.issues[0].message},400);
    const rawKey=req.headers.get('x-project-key');
    const resolved=rawKey ? await resolveProjectByRawKey(rawKey) : null;
    if(!rawKey || !resolved || !resolved.keyPrefix.startsWith('pk_')) return respond({ok:false,error:'Invalid project API key.'},401);
    if(body.data.events.some(e=>e.projectKey!==rawKey)) return respond({ok:false,error:'Project key does not match event tenant.'},403);
    const result=await ingest(resolved.projectId,body.data.events);
    return respond({ok:result.conflicts.length===0,...result},result.conflicts.length ? 409 : 200);
  } catch(error) {
    console.error('ingest_failed', {requestId,error});
    return respond({ok:false,error:'ingest_failed',requestId},500);
  }
}
