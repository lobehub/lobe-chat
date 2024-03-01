import NextAuth from 'next-auth';
import Auth0 from 'next-auth/providers/auth0';

import { getServerConfig } from '@/config/server';

const { AUTH0_CLIENT_ID, ENABLE_OAUTH_SSO, AUTH0_CLIENT_SECRET, AUTH0_ISSUER, NEXTAUTH_SECRET } =
  getServerConfig();

declare module '@auth/core/jwt' {
  // Returned by the `jwt` callback and `auth`, when using JWT sessions
  interface JWT {
    userId?: string;
  }
}

const nextAuth = NextAuth({
  callbacks: {
    // Note: Data processing order of callback: authorize --> jwt --> session
    async jwt({ token, account }) {
      // Auth.js will process the `providerAccountId` automatically
      // ref: https://authjs.dev/reference/core/types#provideraccountid
      if (account) {
        token.userId = account.providerAccountId;
      }
      return token;
    },
    async session({ session, token }) {
      // Pick userid from token
      if (session.user) {
        session.user.id = token.userId ?? session.user.id;
      }
      return session;
    },
  },
  providers: ENABLE_OAUTH_SSO
    ? [
        Auth0({
          // Specify auth scope, at least include 'openid email'
          // all scopes in Auth0 ref: https://auth0.com/docs/get-started/apis/scopes/openid-connect-scopes#standard-claims
          authorization: { params: { scope: 'openid email profile' } },
          clientId: AUTH0_CLIENT_ID,
          clientSecret: AUTH0_CLIENT_SECRET,
          issuer: AUTH0_ISSUER,
        }),
      ]
    : [],
  secret: NEXTAUTH_SECRET,
  trustHost: true,
});

export const {
  handlers: { GET, POST },
  auth,
} = nextAuth;
