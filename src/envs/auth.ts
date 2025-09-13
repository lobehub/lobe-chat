/* eslint-disable sort-keys-fix/sort-keys-fix , typescript-sort-keys/interface */
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      // ===== Clerk ===== //
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?: string;
      CLERK_SECRET_KEY?: string;
      CLERK_WEBHOOK_SECRET?: string;

      // ===== Next Auth ===== //
      NEXT_AUTH_SECRET?: string;

      NEXT_AUTH_SSO_PROVIDERS?: string;

      NEXT_AUTH_DEBUG?: string;

      NEXT_AUTH_SSO_SESSION_STRATEGY?: string;

      AUTH0_CLIENT_ID?: string;
      AUTH0_CLIENT_SECRET?: string;
      AUTH0_ISSUER?: string;

      // Github
      GITHUB_CLIENT_ID?: string;
      GITHUB_CLIENT_SECRET?: string;

      // Azure AD
      AZURE_AD_CLIENT_ID?: string;
      AZURE_AD_CLIENT_SECRET?: string;
      AZURE_AD_TENANT_ID?: string;

      // AUTHENTIK
      AUTHENTIK_CLIENT_ID?: string;
      AUTHENTIK_CLIENT_SECRET?: string;
      AUTHENTIK_ISSUER?: string;

      // ZITADEL
      ZITADEL_CLIENT_ID?: string;
      ZITADEL_CLIENT_SECRET?: string;
      ZITADEL_ISSUER?: string;
    }
  }
}

// TODO(NextAuth ENVs Migration): Remove once nextauth envs migration time end
const removeTipsTemplate = (willBeRemoved: string, replaceOne: string) =>
  `${willBeRemoved} will be removed in the future. Please set ${replaceOne} instead.`;
// End

export const getAuthConfig = () => {
  // TODO(NextAuth ENVs Migration): Remove once nextauth envs migration time end
  if (process.env.AUTH0_CLIENT_ID) {
    console.warn(removeTipsTemplate('AUTH0_CLIENT_ID', 'AUTH_AUTH0_ID'));
  }
  if (process.env.AUTH0_CLIENT_SECRET) {
    console.warn(removeTipsTemplate('AUTH0_CLIENT_SECRET', 'AUTH_AUTH0_SECRET'));
  }
  if (process.env.AUTH0_ISSUER) {
    console.warn(removeTipsTemplate('AUTH0_ISSUER', 'AUTH_AUTH0_ISSUER'));
  }
  if (process.env.AUTHENTIK_CLIENT_ID) {
    console.warn(removeTipsTemplate('AUTHENTIK_CLIENT_ID', 'AUTH_AUTHENTIK_ID'));
  }
  if (process.env.AUTHENTIK_CLIENT_SECRET) {
    console.warn(removeTipsTemplate('AUTHENTIK_CLIENT_SECRET', 'AUTH_AUTHENTIK_SECRET'));
  }
  if (process.env.AUTHENTIK_ISSUER) {
    console.warn(removeTipsTemplate('AUTHENTIK_ISSUER', 'AUTH_AUTHENTIK_ISSUER'));
  }
  if (process.env.AUTHELIA_CLIENT_ID) {
    console.warn(removeTipsTemplate('AUTHELIA_CLIENT_ID', 'AUTH_AUTHELIA_ID'));
  }
  if (process.env.AUTHELIA_CLIENT_SECRET) {
    console.warn(removeTipsTemplate('AUTHELIA_CLIENT_SECRET', 'AUTH_AUTHELIA_SECRET'));
  }
  if (process.env.AUTHELIA_ISSUER) {
    console.warn(removeTipsTemplate('AUTHELIA_ISSUER', 'AUTH_AUTHELIA_ISSUER'));
  }
  if (process.env.AZURE_AD_CLIENT_ID) {
    console.warn(removeTipsTemplate('AZURE_AD_CLIENT_ID', 'AUTH_AZURE_AD_ID'));
  }
  if (process.env.AZURE_AD_CLIENT_SECRET) {
    console.warn(removeTipsTemplate('AZURE_AD_CLIENT_SECRET', 'AUTH_AZURE_AD_SECRET'));
  }
  if (process.env.AZURE_AD_TENANT_ID) {
    console.warn(removeTipsTemplate('AZURE_AD_TENANT_ID', 'AUTH_AZURE_AD_TENANT_ID'));
  }
  if (process.env.CLOUDFLARE_ZERO_TRUST_CLIENT_ID) {
    console.warn(
      removeTipsTemplate('CLOUDFLARE_ZERO_TRUST_CLIENT_ID', 'AUTH_CLOUDFLARE_ZERO_TRUST_ID'),
    );
  }
  if (process.env.CLOUDFLARE_ZERO_TRUST_CLIENT_SECRET) {
    console.warn(
      removeTipsTemplate(
        'CLOUDFLARE_ZERO_TRUST_CLIENT_SECRET',
        'AUTH_CLOUDFLARE_ZERO_TRUST_SECRET',
      ),
    );
  }
  if (process.env.CLOUDFLARE_ZERO_TRUST_ISSUER) {
    console.warn(
      removeTipsTemplate('CLOUDFLARE_ZERO_TRUST_ISSUER', 'AUTH_CLOUDFLARE_ZERO_TRUST_ISSUER'),
    );
  }
  if (process.env.GENERIC_OIDC_CLIENT_ID) {
    console.warn(removeTipsTemplate('GENERIC_OIDC_CLIENT_ID', 'AUTH_GENERIC_OIDC_ID'));
  }
  if (process.env.GENERIC_OIDC_CLIENT_SECRET) {
    console.warn(removeTipsTemplate('GENERIC_OIDC_CLIENT_SECRET', 'AUTH_GENERIC_OIDC_SECRET'));
  }
  if (process.env.GENERIC_OIDC_ISSUER) {
    console.warn(removeTipsTemplate('GENERIC_OIDC_ISSUER', 'AUTH_GENERIC_OIDC_ISSUER'));
  }
  if (process.env.GITHUB_CLIENT_ID) {
    console.warn(removeTipsTemplate('GITHUB_CLIENT_ID', 'AUTH_GITHUB_ID'));
  }
  if (process.env.GITHUB_CLIENT_SECRET) {
    console.warn(removeTipsTemplate('GITHUB_CLIENT_SECRET', 'AUTH_GITHUB_SECRET'));
  }
  if (process.env.LOGTO_CLIENT_ID) {
    console.warn(removeTipsTemplate('LOGTO_CLIENT_ID', 'AUTH_LOGTO_ID'));
  }
  if (process.env.LOGTO_CLIENT_SECRET) {
    console.warn(removeTipsTemplate('LOGTO_CLIENT_SECRET', 'AUTH_LOGTO_SECRET'));
  }
  if (process.env.LOGTO_ISSUER) {
    console.warn(removeTipsTemplate('LOGTO_ISSUER', 'AUTH_LOGTO_ISSUER'));
  }
  if (process.env.ZITADEL_CLIENT_ID) {
    console.warn(removeTipsTemplate('ZITADEL_CLIENT_ID', 'AUTH_ZITADEL_ID'));
  }
  if (process.env.ZITADEL_CLIENT_SECRET) {
    console.warn(removeTipsTemplate('ZITADEL_CLIENT_SECRET', 'AUTH_ZITADEL_SECRET'));
  }
  if (process.env.ZITADEL_ISSUER) {
    console.warn(removeTipsTemplate('ZITADEL_ISSUER', 'AUTH_ZITADEL_ISSUER'));
  }
  // End

  return createEnv({
    client: {
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional(),
      /**
       * whether to enabled clerk
       */
      NEXT_PUBLIC_ENABLE_CLERK_AUTH: z.boolean().optional(),

      NEXT_PUBLIC_ENABLE_NEXT_AUTH: z.boolean().optional(),
    },
    server: {
      // Clerk
      CLERK_SECRET_KEY: z.string().optional(),
      CLERK_WEBHOOK_SECRET: z.string().optional(),

      // NEXT-AUTH
      NEXT_AUTH_SECRET: z.string().optional(),
      NEXT_AUTH_SSO_PROVIDERS: z.string().optional().default('auth0'),
      NEXT_AUTH_DEBUG: z.boolean().optional().default(false),
      NEXT_AUTH_SSO_SESSION_STRATEGY: z.enum(['jwt', 'database']).optional().default('jwt'),

      // Auth0
      AUTH0_CLIENT_ID: z.string().optional(),
      AUTH0_CLIENT_SECRET: z.string().optional(),
      AUTH0_ISSUER: z.string().optional(),

      // Github
      GITHUB_CLIENT_ID: z.string().optional(),
      GITHUB_CLIENT_SECRET: z.string().optional(),

      // Azure AD
      AZURE_AD_CLIENT_ID: z.string().optional(),
      AZURE_AD_CLIENT_SECRET: z.string().optional(),
      AZURE_AD_TENANT_ID: z.string().optional(),

      // AUTHENTIK
      AUTHENTIK_CLIENT_ID: z.string().optional(),
      AUTHENTIK_CLIENT_SECRET: z.string().optional(),
      AUTHENTIK_ISSUER: z.string().optional(),

      // AUTHELIA
      AUTHELIA_CLIENT_ID: z.string().optional(),
      AUTHELIA_CLIENT_SECRET: z.string().optional(),
      AUTHELIA_ISSUER: z.string().optional(),

      // Cloudflare Zero Trust
      CLOUDFLARE_ZERO_TRUST_CLIENT_ID: z.string().optional(),
      CLOUDFLARE_ZERO_TRUST_CLIENT_SECRET: z.string().optional(),
      CLOUDFLARE_ZERO_TRUST_ISSUER: z.string().optional(),

      // Generic OIDC
      GENERIC_OIDC_CLIENT_ID: z.string().optional(),
      GENERIC_OIDC_CLIENT_SECRET: z.string().optional(),
      GENERIC_OIDC_ISSUER: z.string().optional(),

      // ZITADEL
      ZITADEL_CLIENT_ID: z.string().optional(),
      ZITADEL_CLIENT_SECRET: z.string().optional(),
      ZITADEL_ISSUER: z.string().optional(),

      // LOGTO
      LOGTO_CLIENT_ID: z.string().optional(),
      LOGTO_CLIENT_SECRET: z.string().optional(),
      LOGTO_ISSUER: z.string().optional(),
      LOGTO_WEBHOOK_SIGNING_KEY: z.string().optional(),

      // Casdoor
      CASDOOR_WEBHOOK_SECRET: z.string().optional(),
    },

    runtimeEnv: {
      // Clerk
      NEXT_PUBLIC_ENABLE_CLERK_AUTH: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
      CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,

      // Next Auth
      NEXT_PUBLIC_ENABLE_NEXT_AUTH: process.env.NEXT_PUBLIC_ENABLE_NEXT_AUTH === '1',
      NEXT_AUTH_SSO_PROVIDERS: process.env.NEXT_AUTH_SSO_PROVIDERS,
      NEXT_AUTH_SECRET: process.env.NEXT_AUTH_SECRET,
      NEXT_AUTH_DEBUG: !!process.env.NEXT_AUTH_DEBUG,
      NEXT_AUTH_SSO_SESSION_STRATEGY: process.env.NEXT_AUTH_SSO_SESSION_STRATEGY || 'jwt',

      // Auth0
      AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
      AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
      AUTH0_ISSUER: process.env.AUTH0_ISSUER,

      // Github
      GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
      GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,

      // Azure AD
      AZURE_AD_CLIENT_ID: process.env.AZURE_AD_CLIENT_ID,
      AZURE_AD_CLIENT_SECRET: process.env.AZURE_AD_CLIENT_SECRET,
      AZURE_AD_TENANT_ID: process.env.AZURE_AD_TENANT_ID,

      // AUTHENTIK
      AUTHENTIK_CLIENT_ID: process.env.AUTHENTIK_CLIENT_ID,
      AUTHENTIK_CLIENT_SECRET: process.env.AUTHENTIK_CLIENT_SECRET,
      AUTHENTIK_ISSUER: process.env.AUTHENTIK_ISSUER,

      // AUTHELIA
      AUTHELIA_CLIENT_ID: process.env.AUTHELIA_CLIENT_ID,
      AUTHELIA_CLIENT_SECRET: process.env.AUTHELIA_CLIENT_SECRET,
      AUTHELIA_ISSUER: process.env.AUTHELIA_ISSUER,

      // Cloudflare Zero Trust
      CLOUDFLARE_ZERO_TRUST_CLIENT_ID: process.env.CLOUDFLARE_ZERO_TRUST_CLIENT_ID,
      CLOUDFLARE_ZERO_TRUST_CLIENT_SECRET: process.env.CLOUDFLARE_ZERO_TRUST_CLIENT_SECRET,
      CLOUDFLARE_ZERO_TRUST_ISSUER: process.env.CLOUDFLARE_ZERO_TRUST_ISSUER,

      // Generic OIDC
      GENERIC_OIDC_CLIENT_ID: process.env.GENERIC_OIDC_CLIENT_ID,
      GENERIC_OIDC_CLIENT_SECRET: process.env.GENERIC_OIDC_CLIENT_SECRET,
      GENERIC_OIDC_ISSUER: process.env.GENERIC_OIDC_ISSUER,

      // ZITADEL
      ZITADEL_CLIENT_ID: process.env.ZITADEL_CLIENT_ID,
      ZITADEL_CLIENT_SECRET: process.env.ZITADEL_CLIENT_SECRET,
      ZITADEL_ISSUER: process.env.ZITADEL_ISSUER,

      // LOGTO
      LOGTO_CLIENT_ID: process.env.LOGTO_CLIENT_ID,
      LOGTO_CLIENT_SECRET: process.env.LOGTO_CLIENT_SECRET,
      LOGTO_ISSUER: process.env.LOGTO_ISSUER,
      LOGTO_WEBHOOK_SIGNING_KEY: process.env.LOGTO_WEBHOOK_SIGNING_KEY,

      // Casdoor
      CASDOOR_WEBHOOK_SECRET: process.env.CASDOOR_WEBHOOK_SECRET,
    },
  });
};

export const authEnv = getAuthConfig();
