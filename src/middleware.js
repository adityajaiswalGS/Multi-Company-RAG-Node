// src/middleware.js
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // GET FRESH SESSION EVERY TIME — THIS IS THE KEY
  const { data: { session } } = await supabase.auth.getSession();

  // FORCE REFRESH SESSION — THIS FIXES THE BUG
  if (session) {
    await supabase.auth.refreshSession();
  }

  const pathname = req.nextUrl.pathname;

  // SKIP REDIRECT LOGIC FOR STATIC FILES AND API
  if (pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return res;
  }

  // ROOT → redirect based on role
  if (pathname === '/') {
    if (!session) return NextResponse.redirect(new URL('/login', req.url));

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    const redirectTo = profile?.role === 'admin' ? '/admin' : '/chat';
    return NextResponse.redirect(new URL(redirectTo, req.url));
  }

  // PROTECTED ROUTES
  if (pathname.startsWith('/admin')) {
    if (!session) return NextResponse.redirect(new URL('/login', req.url));

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/chat', req.url));
    }
  }

  if (pathname.startsWith('/chat') && !session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (pathname === '/login' && session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    const redirectTo = profile?.role === 'admin' ? '/admin' : '/chat';
    return NextResponse.redirect(new URL(redirectTo, req.url));
  }

  return res;
}

export const config = {
  matcher: ['/', '/login', '/admin/:path*', '/chat'],
};