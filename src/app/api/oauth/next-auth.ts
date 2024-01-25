import NextAuth from 'next-auth';
import Auth0 from 'next-auth/providers/auth0';

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
  auth,
} = nextAuth;
