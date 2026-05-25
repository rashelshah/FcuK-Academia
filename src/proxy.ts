import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { SESSION_COOKIE } from '@/lib/auth-constants';

const PUBLIC_PATHS = ['/login'];
const PUBLIC_FILE_PATTERN = /\.[^/]+$/;
const PUBLIC_PWA_PATHS = new Set([
  '/manifest.json',
  '/sw.js',
  '/offline.html',
  '/maskable-icon-512x512.png',
]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isStatic =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico' ||
    PUBLIC_PWA_PATHS.has(pathname) ||
    PUBLIC_FILE_PATTERN.test(pathname);

  if (isStatic) return NextResponse.next();

  // --- FCUK WRAP FEATURE FLAG ---
  const isWrapMode = process.env.NEXT_PUBLIC_WRAP_MODE === 'true';
  console.log('PROXY FIRED, PATH:', pathname, 'WRAP_MODE:', process.env.NEXT_PUBLIC_WRAP_MODE, 'IS_WRAP_MODE:', isWrapMode);
  if (isWrapMode) {
    if (pathname === '/wrap') {
      return NextResponse.next();
    }
    return NextResponse.rewrite(new URL('/wrap', request.url));
  }
  // ------------------------------

  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  const isPublic = PUBLIC_PATHS.includes(pathname);

  if (!hasSession && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (hasSession && isPublic) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
