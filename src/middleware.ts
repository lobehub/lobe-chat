import { NextRequest, NextResponse } from 'next/server';

const PASSWORD = 'wx1313611';  // 将your-password替换为你想设置的密码

export function middleware(req: NextRequest) {
  const url = req.nextUrl;

  if (url.pathname === '/api/auth') {
    return NextResponse.next();
  }

  const password = req.headers.get('x-password');

  if (password === PASSWORD) {
    return NextResponse.next();
  } else {
    url.pathname = '/api/auth';
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - static (static files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|static|favicon.ico).*)',
  ],
};
