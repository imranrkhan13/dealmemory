import { NextResponse } from 'next/server';
export function error(message: string, status = 400) { return NextResponse.json({ ok: false, error: message }, { status }); }
export function ok<T>(data: T) { return NextResponse.json({ ok: true, ...data }); }
