import NextAuth from 'next-auth';
import Auth0 from 'next-auth/providers/auth0';

import { getServerConfig } from '@/config/server';

const { AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_ISSUER } = getServerConfig();

const nextAuth = NextAuth({
  providers: [
    Auth0({
      clientId: AUTH0_CLIENT_ID,
      clientSecret: AUTH0_CLIENT_SECRET,
      issuer: AUTH0_ISSUER,
    }),
  ],
});

export const {
  handlers: { GET, POST },
  auth,
} = nextAuth;
