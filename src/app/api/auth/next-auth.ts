import NextAuth from 'next-auth';
import Auth0 from 'next-auth/providers/auth0';
import Authentik from 'next-auth/providers/authentik';
import AzureAd from 'next-auth/providers/azure-ad';

import { getServerConfig } from '@/config/server';

const {
  ENABLE_OAUTH_SSO,
  SSO_PROVIDERS,
  AUTH0_CLIENT_ID,
  AUTH0_CLIENT_SECRET,
  AUTH0_ISSUER,
  AZURE_AD_CLIENT_ID,
  AZURE_AD_CLIENT_SECRET,
  AZURE_AD_TENANT_ID,
  AUTHENTIK_CLIENT_ID,
  AUTHENTIK_CLIENT_SECRET,
  AUTHENTIK_ISSUER,
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
    ? SSO_PROVIDERS.split(/[,，]/).map((provider) => {
        switch (provider) {
          case 'auth0': {
            return Auth0({
              // Specify auth scope, at least include 'openid email'
              // all scopes in Auth0 ref: https://auth0.com/docs/get-started/apis/scopes/openid-connect-scopes#standard-claims
              authorization: { params: { scope: 'openid email profile' } },
              clientId: AUTH0_CLIENT_ID,
              clientSecret: AUTH0_CLIENT_SECRET,
              issuer: AUTH0_ISSUER,
            });
          }
          case 'azure-ad': {
            return AzureAd({
              // Specify auth scope, at least include 'openid email'
              // all scopes in Azure AD ref: https://learn.microsoft.com/en-us/entra/identity-platform/scopes-oidc#openid-connect-scopes
              authorization: { params: { scope: 'openid email profile' } },
              clientId: AZURE_AD_CLIENT_ID,
              clientSecret: AZURE_AD_CLIENT_SECRET,
              tenantId: AZURE_AD_TENANT_ID,
            });
          }
          case 'authentik': {
            return Authentik({
              // Specify auth scope, at least include 'openid email'
              // all scopes in Authentik ref: https://goauthentik.io/docs/providers/oauth2
              authorization: { params: { scope: 'openid email profile' } },
              clientId: AUTHENTIK_CLIENT_ID,
              clientSecret: AUTHENTIK_CLIENT_SECRET,
              issuer: AUTHENTIK_ISSUER,
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
