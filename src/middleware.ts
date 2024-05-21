import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { authEnv } from '@/config/auth';
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

export default authEnv.NEXT_PUBLIC_ENABLE_CLERK_AUTH
  ? // can't lift to a function because if there is no clerk public key, it will throw error
    clerkMiddleware((auth, request) => {
      // if user is logged in and on the home page, redirect to chat
      if (auth().userId && request.nextUrl.pathname === '/') {
        request.nextUrl.pathname = '/chat';
        return NextResponse.redirect(request.nextUrl);
      }

      return NextResponse.next();
    })
  : authEnv.NEXT_PUBLIC_ENABLE_NEXT_AUTH
    ? nextAuthMiddleware
    : defaultMiddleware;
