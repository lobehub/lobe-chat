import NextAuth from 'next-auth';
import Auth0 from 'next-auth/providers/auth0';
import AzureAd from 'next-auth/providers/azure-ad';

import { getServerConfig } from '@/config/server';

const {
  ENABLE_OAUTH_SSO,
  SSO_PROVIDER,
  AUTH0_CLIENT_ID,
  AUTH0_CLIENT_SECRET,
  AUTH0_ISSUER,
  AZURE_AD_CLIENT_ID,
  AZURE_AD_CLIENT_SECRET,
  AZURE_AD_TENANT_ID,
  NEXTAUTH_SECRET,
} = getServerConfig();

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
    ? SSO_PROVIDER.split(',').map((provider) => {
        switch (provider) {
          case 'auth0': {
            return Auth0({
              clientId: AUTH0_CLIENT_ID,
              clientSecret: AUTH0_CLIENT_SECRET,
              issuer: AUTH0_ISSUER,
            });
          }
          case 'azure-ad': {
            return AzureAd({
              clientId: AZURE_AD_CLIENT_ID,
              clientSecret: AZURE_AD_CLIENT_SECRET,
              tenantId: AZURE_AD_TENANT_ID,
            });
          }
          default: {
            throw new Error(`[NextAuth] provider ${provider} is not supported`);
          }
        }
      })
    : [],
  secret: NEXTAUTH_SECRET,
  trustHost: true,
});

export const {
  handlers: { GET, POST },
  auth,
} = nextAuth;
