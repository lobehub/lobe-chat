import { NextResponse } from 'next/server';

import { getServerConfig } from '@/config/server';
import { auth } from '@/libs/next-auth';

import { OAUTH_AUTHORIZED } from './const/auth';

export const config = {
  matcher: '/api/:path*',
};
const defaultMiddleware = () => NextResponse.next();

const withAuthMiddleware = auth((req) => {
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

const { ENABLE_OAUTH_SSO } = getServerConfig();

export default !ENABLE_OAUTH_SSO ? defaultMiddleware : withAuthMiddleware;
