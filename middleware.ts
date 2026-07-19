import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PUBLIC_PAGE_PATHS = new Set<string>([
  '/',
  '/pricing',
  '/auth/signin',
  '/login',
  '/signup',
]);

const PUBLIC_API_PREFIXES = [
  '/api/auth',
  '/api/webhooks/dodo',
  '/api/v1/events/batch',
];

const PROTECTED_PAGE_PREFIXES = [
  '/overview',
  '/journeys',
  '/settings',
  '/sdk',
  '/billing',
  '/dashboard',
];

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Always allow static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/images') ||
    /\.(png|jpg|jpeg|svg|gif|ico|css|js|map)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // If user is already authenticated, do not show the sign-in page — redirect to callback or overview
  if (pathname === '/auth/signin' || pathname.startsWith('/auth/signin')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (token) {
      const cb = req.nextUrl.searchParams.get('callbackUrl');
      const safe =
        cb && cb.startsWith('/') && !cb.startsWith('/auth') ? cb : '/overview';
      const url = req.nextUrl.clone();
      url.pathname = safe;
      url.search = '';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // API handling
  if (pathname.startsWith('/api')) {
    // Allow specific public API endpoints (ingestion + webhooks + next-auth)
    if (PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p))) {
      return NextResponse.next();
    }

    // All other API routes require a valid NextAuth session (JWT)
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ ok: false, error: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Public pages
  if (PUBLIC_PAGE_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  // Protected pages
  const requiresAuth = PROTECTED_PAGE_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (requiresAuth) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = '/auth/signin';
      if (pathname) {
        url.searchParams.set('callbackUrl', `${pathname}${search ?? ''}`);
      }
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run on all paths except static assets; in-function logic handles allow/deny
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};