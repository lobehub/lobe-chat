import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { UAParser } from 'ua-parser-js';

import { authEnv } from '@/config/auth';
import { LOBE_THEME_APPEARANCE } from '@/const/theme';
import NextAuthEdge from '@/libs/next-auth/edge';
import { Locales } from '@/locales/resources';
import { parseBrowserLanguage } from '@/utils/locale';
import { RouteVariants } from '@/utils/server/routeVariants';

import { OAUTH_AUTHORIZED } from './const/auth';

export const config = {
  matcher: [
    // include any files in the api or trpc folders that might have an extension
    '/(api|trpc|webapi)(.*)',
    // include the /
    '/',
    '/discover',
    '/discover(.*)',
    '/chat',
    '/chat(.*)',
    '/changelog(.*)',
    '/settings(.*)',
    '/files',
    '/files(.*)',
    '/repos(.*)',
    '/profile(.*)',
    '/me',
    '/me(.*)',

    '/login(.*)',
    '/signup(.*)',
    '/next-auth/error',
    // ↓ cloud ↓
  ],
};

const parseDefaultThemeFromTime = (request: NextRequest) => {
  // 获取经度信息，Next.js 会自动解析 geo 信息到请求对象中
  const longitude = 'geo' in request && (request.geo as any)?.longitude;

  if (typeof longitude === 'number') {
    // 计算时区偏移（每15度经度对应1小时）
    // 东经为正，西经为负
    const offsetHours = Math.round(longitude / 15);

    // 计算当地时间
    const localHour = (new Date().getUTCHours() + offsetHours + 24) % 24;
    console.log(`[theme] localHour: ${localHour}`);

    // 6点到18点之间返回 light 主题
    return localHour >= 6 && localHour < 18 ? 'light' : 'dark';
  }

  return 'light';
};

const defaultMiddleware = (request: NextRequest) => {
  // 1. 从 cookie 中读取用户偏好
  const theme =
    request.cookies.get(LOBE_THEME_APPEARANCE)?.value || parseDefaultThemeFromTime(request);

  // if it's a new user, there's no cookie
  // So we need to use the fallback language parsed by accept-language
  const locale = parseBrowserLanguage(request.headers) as Locales;
  // const locale =
  // request.cookies.get(LOBE_LOCALE_COOKIE)?.value ||
  // browserLanguage;

  const ua = request.headers.get('user-agent');

  const device = new UAParser(ua || '').getDevice();

  // 2. 创建规范化的偏好值
  const route = RouteVariants.serializeVariants({
    isMobile: device.type === 'mobile',
    locale,
    theme,
  });

  const url = new URL(request.url);

  // skip all api requests
  if (['/api', '/trpc', '/webapi'].some((path) => url.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // refs: https://github.com/lobehub/lobe-chat/pull/5866
  // new handle segment rewrite: /${route}${originalPathname}
  // / -> /zh-CN__0__dark
  // /discover -> /zh-CN__0__dark/discover
  const nextPathname = `/${route}` + (url.pathname === '/' ? '' : url.pathname);
  console.log(`[rewrite] ${url.pathname} -> ${nextPathname}`);

  url.pathname = nextPathname;

  return NextResponse.rewrite(url, { status: 200 });
};

// Initialize an Edge compatible NextAuth middleware
const nextAuthMiddleware = NextAuthEdge.auth((req) => {
  const response = defaultMiddleware(req);

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
  '/onboard(.*)',
  // ↓ cloud ↓
]);

const clerkAuthMiddleware = clerkMiddleware(
  async (auth, req) => {
    if (isProtectedRoute(req)) await auth.protect();

    return defaultMiddleware(req);
  },
  {
    // https://github.com/lobehub/lobe-chat/pull/3084
    clockSkewInMs: 60 * 60 * 1000,
    signInUrl: '/login',
    signUpUrl: '/signup',
  },
);

export default authEnv.NEXT_PUBLIC_ENABLE_CLERK_AUTH
  ? clerkAuthMiddleware
  : authEnv.NEXT_PUBLIC_ENABLE_NEXT_AUTH
    ? nextAuthMiddleware
    : defaultMiddleware;
