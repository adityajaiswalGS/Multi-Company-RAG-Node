import { NextResponse } from 'next/server';

export default async function proxy(req) { 
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;

  // Allow system files and API routes to pass through
  if (pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return res;
  }

  // Temporary: Allow all routes while we transition to Node.js Auth
  // We will handle protection inside the actual Pages/Components for now
  return res;
}

export const config = {
  matcher: ['/', '/login', '/admin/:path*', '/chat'],
};