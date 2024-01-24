import NextAuth, { Session } from 'next-auth';
import Auth0 from 'next-auth/providers/auth0';
// Fix from: https://github.com/nextauthjs/next-auth/issues/9344
import { AppRouteHandlerFn } from 'next/dist/server/future/route-modules/app-route/module';
import { NextRequest } from 'next/server';

export interface NextAuthRequest extends NextRequest {
  auth: Session | null;
}

const nextAuth = NextAuth({
  providers: [
    Auth0({
      clientId: process.env.AUTH0_CLIENT_ID || '',
      clientSecret: process.env.AUTH0_CLIENT_SECRET || '',
      issuer: process.env.AUTH0_ISSUER,
    }),
  ],
});

export const {
  handlers: { GET, POST },
  signIn,
  signOut,
} = nextAuth;

export const auth = nextAuth.auth as typeof nextAuth.auth &
  (<HandlerResponse extends Response | Promise<Response>>(
    ...args: [
      (
        req: NextAuthRequest,
        context: { params: Record<string, string | string[] | undefined> },
      ) => HandlerResponse,
    ]
  ) => (
    req: Parameters<AppRouteHandlerFn>[0],
    context: Parameters<AppRouteHandlerFn>[1],
  ) => HandlerResponse);
