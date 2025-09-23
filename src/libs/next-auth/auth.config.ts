import type { NextAuthConfig } from 'next-auth';

import { getServerDBConfig } from '@/config/db';
import { getAuthConfig } from '@/envs/auth';

import { LobeNextAuthDbAdapter } from './adapter';
import { ssoProviders } from './sso-providers';

const {
  NEXT_AUTH_DEBUG,
  NEXT_AUTH_SECRET,
  NEXT_AUTH_SSO_SESSION_STRATEGY,
  NEXT_AUTH_SSO_PROVIDERS,
  NEXT_PUBLIC_ENABLE_NEXT_AUTH,
} = getAuthConfig();

const { NEXT_PUBLIC_ENABLED_SERVER_SERVICE } = getServerDBConfig();

export const initSSOProviders = () => {
  return NEXT_PUBLIC_ENABLE_NEXT_AUTH
    ? NEXT_AUTH_SSO_PROVIDERS.split(/[,，]/).map((provider) => {
        const validProvider = ssoProviders.find((item) => item.id === provider.trim());

        if (validProvider) return validProvider.provider;

        throw new Error(`[NextAuth] provider ${provider} is not supported`);
      })
    : [];
};

// Notice this is only an object, not a full Auth.js instance
export default {
  adapter: NEXT_PUBLIC_ENABLED_SERVER_SERVICE ? LobeNextAuthDbAdapter() : undefined,
  callbacks: {
    // Note: Data processing order of callback: authorize --> jwt --> session
    async jwt({ token, user }) {
      // ref: https://authjs.dev/guides/extending-the-session#with-jwt
      if (user?.id) {
        token.userId = user?.id;
      }
      return token;
    },
    async session({ session, token, user }) {
      if (session.user) {
        // ref: https://authjs.dev/guides/extending-the-session#with-database
        if (user) {
          session.user.id = user.id;
        } else {
          session.user.id = (token.userId ?? session.user.id) as string;
        }
      }
      return session;
    },
  },
  debug: NEXT_AUTH_DEBUG,
  pages: {
    error: '/next-auth/error',
    signIn: '/next-auth/signin',
  },
  providers: initSSOProviders(),
  secret: NEXT_AUTH_SECRET,
  session: {
    // Force use JWT if server service is disabled
    strategy: NEXT_PUBLIC_ENABLED_SERVER_SERVICE ? NEXT_AUTH_SSO_SESSION_STRATEGY : 'jwt',
  },
  trustHost: process.env?.AUTH_TRUST_HOST ? process.env.AUTH_TRUST_HOST === 'true' : true,
} satisfies NextAuthConfig;
