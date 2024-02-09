import NextAuth from 'next-auth';
import Auth0 from 'next-auth/providers/auth0';

import { getServerConfig } from '@/config/server';

const { AUTH0_CLIENT_ID, ENABLE_OAUTH_SSO, AUTH0_CLIENT_SECRET, AUTH0_ISSUER, NEXTAUTH_SECRET } =
  getServerConfig();

const nextAuth = NextAuth({
  providers: ENABLE_OAUTH_SSO
    ? [
        Auth0({
          clientId: AUTH0_CLIENT_ID,
          clientSecret: AUTH0_CLIENT_SECRET,
          issuer: AUTH0_ISSUER,
        }),
      ]
    : [],
  secret: NEXTAUTH_SECRET,
});

export const {
  handlers: { GET, POST },
  auth,
} = nextAuth;
