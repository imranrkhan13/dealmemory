import NextAuth from 'next-auth';
import { authOptions } from '@/lib/nextauth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const { GET, POST } = NextAuth(authOptions);
