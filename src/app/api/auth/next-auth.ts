import NextAuth from 'next-auth';
import Auth0 from 'next-auth/providers/auth0';

import { getServerConfig } from '@/config/server';

const { AUTH0_CLIENT_ID, ENABLE_OAUTH_SSO, AUTH0_CLIENT_SECRET, AUTH0_ISSUER, NEXTAUTH_SECRET } =
  getServerConfig();

const nextAuth = NextAuth({
  callbacks: {
    async jwt({ token, profile }) {
      // Override with the attributes from the Auth0 Profile.
      // Default values for profile.sub: 'auth0|USER-ID'.
      // ref: https://auth0.com/docs/get-started/apis/scopes/sample-use-cases-scopes-and-claims#authenticate-a-user-and-request-standard-claims
      if (profile) {
        token.sub = profile.sub ?? token.sub;
      }
      return token;
    },
    async session({ session, token }) {
      // Pick userid from token
      if (session.user) {
        session.user.id = token.sub ?? session.user.id;
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
