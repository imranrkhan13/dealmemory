import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = 3600;

let cachedScript: string | null = null;

export async function GET() {
  if (!cachedScript) {
    try {
      const filePath = resolve(process.cwd(), 'public/v1.js');
      cachedScript = readFileSync(filePath, 'utf8');
    } catch {
      cachedScript = '// DealMemory client bundle';
    }
  }

  return new NextResponse(cachedScript, {
    status: 200,
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Max-Age': '86400',
    },
  });
}
