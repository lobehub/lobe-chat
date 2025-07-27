import type { Provider } from '@auth/core/providers';
import type { NextAuthConfig } from 'next-auth';

import { authEnv } from '@/config/auth';

import { ssoProviders } from './sso-providers';

export function initSSOProviders() {
  const enabledFlag = authEnv.NEXT_PUBLIC_ENABLE_NEXT_AUTH;
  const providers: Provider[] = [];

  if (!enabledFlag) return providers;

  const enabledKeys = authEnv.NEXT_AUTH_SSO_PROVIDERS.split(/[,，]/);
  for (const key of enabledKeys) {
    const provider = ssoProviders[key];
    if (!provider) throw new Error(`[NextAuth] provider ${key} is not supported`);
    providers.push(provider);
  }

  return providers;
}

// Notice this is only an object, not a full Auth.js instance
export default {
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
  debug: authEnv.NEXT_AUTH_DEBUG,
  pages: {
    error: '/next-auth/error',
    signIn: '/next-auth/signin',
  },
  providers: initSSOProviders(),
  secret: authEnv.NEXT_AUTH_SECRET,
  trustHost: process.env?.AUTH_TRUST_HOST ? process.env.AUTH_TRUST_HOST === 'true' : true,
} satisfies NextAuthConfig;
