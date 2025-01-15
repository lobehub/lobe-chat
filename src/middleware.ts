import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { UAParser } from 'ua-parser-js';
import urlJoin from 'url-join';

import { authEnv } from '@/config/auth';
import { DEFAULT_LANG, LOBE_LOCALE_COOKIE } from '@/const/locale';
import { LOBE_THEME_APPEARANCE } from '@/const/theme';
import NextAuthEdge from '@/libs/next-auth/edge';
import { RouteVariants } from '@/utils/server/routeVariants';

import { OAUTH_AUTHORIZED } from './const/auth';

export const config = {
  matcher: [
    // include any files in the api or trpc folders that might have an extension
    '/(api|trpc|webapi)(.*)',
    // include the /
    '/',
    '/chat(.*)',
    '/settings(.*)',
    '/files(.*)',
    '/repos(.*)',
    // ↓ cloud ↓
  ],
};

const defaultMiddleware = (request: NextRequest) => {
  // 1. 从 cookie 中读取用户偏好
  const theme = request.cookies.get(LOBE_THEME_APPEARANCE)?.value || 'light';
  const language = request.cookies.get(LOBE_LOCALE_COOKIE)?.value || DEFAULT_LANG;

  const ua = request.headers.get('user-agent');

  const device = new UAParser(ua || '').getDevice();

  // 2. 创建规范化的偏好值
  const route = RouteVariants.serializeVariants({
    isMobile: device.type === 'mobile',
    locale: language,
    theme: theme as any,
  });

  console.log('rewrite route:', route);

  const url = new URL(request.url);

  if (['/api', '/trpc', '/webapi'].some((path) => url.pathname.startsWith(path)))
    return NextResponse.next();

  // 3. 处理 URL 重写
  // 构建新路径: /${route}${originalPathname}
  url.pathname = urlJoin(route, url.pathname);

  return NextResponse.rewrite(url);
};

// Initialize an Edge compatible NextAuth middleware
const nextAuthMiddleware = NextAuthEdge.auth((req) => {
  const response = defaultMiddleware(req);
  // skip the '/' route
  if (req.nextUrl.pathname === '/') return response;

  // Just check if session exists
  const session = req.auth;

  // Check if next-auth throws errors
  // refs: https://github.com/lobehub/lobe-chat/pull/1323
  const isLoggedIn = !!session?.expires;

  // Remove & amend OAuth authorized header
  response.headers.delete(OAUTH_AUTHORIZED);
  if (isLoggedIn) {
    response.headers.set(OAUTH_AUTHORIZED, 'true');
  }

  return response;
});

const isProtectedRoute = createRouteMatcher([
  '/settings(.*)',
  '/files(.*)',
  // ↓ cloud ↓
]);

export default authEnv.NEXT_PUBLIC_ENABLE_CLERK_AUTH
  ? clerkMiddleware(
      async (auth, req) => {
        if (isProtectedRoute(req)) await auth.protect();
      },
      {
        // https://github.com/lobehub/lobe-chat/pull/3084
        clockSkewInMs: 60 * 60 * 1000,
        signInUrl: '/login',
        signUpUrl: '/signup',
      },
    )
  : authEnv.NEXT_PUBLIC_ENABLE_NEXT_AUTH
    ? nextAuthMiddleware
    : defaultMiddleware;
