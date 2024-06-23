import NextAuth from 'next-auth';

import authConfig from './auth.config';

// Use split config to avoid db connection init on edge runtime
// ref: https://authjs.dev/guides/edge-compatibility#split-config

// NextAuth with DB
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // Add adapter here
adapter: undefined,
  
  session: {
    strategy: 'jwt',
  },
});

// Edge middleware without db
export const { auth: edgeMiddleware } = NextAuth(authConfig);
