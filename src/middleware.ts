import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { getServerConfig } from '@/config/server';
import { auth } from '@/libs/next-auth';

import { OAUTH_AUTHORIZED } from './const/auth';

export const config = {
  matcher: [
    // include any files in the api or trpc folders that might have an extension
    '/(api|trpc)(.*)',
    // include the /
    '/',
  ],
};

const defaultMiddleware = () => NextResponse.next();

const nextAuthMiddleware = auth((req) => {
  // skip the '/' route
  if (req.nextUrl.pathname === '/') return NextResponse.next();

  // Just check if session exists
  const session = req.auth;

  // Check if next-auth throws errors
  // refs: https://github.com/lobehub/lobe-chat/pull/1323
  const isLoggedIn = !!session?.expires;

  // Remove & amend OAuth authorized header
  const requestHeaders = new Headers(req.headers);
  requestHeaders.delete(OAUTH_AUTHORIZED);
  if (isLoggedIn) requestHeaders.set(OAUTH_AUTHORIZED, 'true');

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
});

const { ENABLE_OAUTH_SSO, ENABLE_CLERK_AUTH } = getServerConfig();

export default ENABLE_CLERK_AUTH
  ? clerkMiddleware()
  : !ENABLE_OAUTH_SSO
    ? defaultMiddleware
    : nextAuthMiddleware;
