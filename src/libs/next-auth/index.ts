import NextAuth from 'next-auth';

import { authEnv } from '@/config/auth';

import { ssoProviders } from './sso-providers';

export const initSSOProviders = () => {
  return authEnv.NEXT_PUBLIC_ENABLE_NEXT_AUTH
    ? authEnv.NEXT_AUTH_SSO_PROVIDERS.split(/[,，]/).map((provider) => {
        const validProvider = ssoProviders.find((item) => item.id === provider);

        if (validProvider) return validProvider.provider;

        throw new Error(`[NextAuth] provider ${provider} is not supported`);
      })
    : [];
};

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
        session.user.id = (token.userId ?? session.user.id) as string;
      }
      return session;
    },
  },
  providers: initSSOProviders(),
  secret: authEnv.NEXT_AUTH_SECRET,
  trustHost: true,
});

export const {
  handlers: { GET, POST },
  auth,
} = nextAuth;

declare module '@auth/core/jwt' {
  // Returned by the `jwt` callback and `auth`, when using JWT sessions
  interface JWT {
    userId?: string;
  }
}
