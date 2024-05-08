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
      /**
       * @deprecated
       */
      ENABLE_OAUTH_SSO?: string;
      NEXT_AUTH_SECRET?: string;
      /**
       * @deprecated
       */
      SSO_PROVIDERS?: string;
      NEXT_AUTH_SSO_PROVIDERS?: string;

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

export const getAuthConfig = () => {
  if (process.env.ENABLE_OAUTH_SSO) {
    console.warn(
      '`ENABLE_OAUTH_SSO` is deprecated and will be removed in LobeChat 1.0. just set `NEXT_AUTH_SECRET` enough',
    );
  }

  if (process.env.SSO_PROVIDERS) {
    console.warn(
      '`SSO_PROVIDERS` is deprecated and will be removed in LobeChat 1.0. Please replace with `NEXT_AUTH_SSO_PROVIDERS`',
    );
  }

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

      // NEXT-AUTH
      NEXT_AUTH_SECRET: z.string().optional(),
      NEXT_AUTH_SSO_PROVIDERS: z.string().optional().default('auth0'),

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

      // ZITADEL
      ZITADEL_CLIENT_ID: z.string().optional(),
      ZITADEL_CLIENT_SECRET: z.string().optional(),
      ZITADEL_ISSUER: z.string().optional(),
    },

    runtimeEnv: {
      // Clerk
      NEXT_PUBLIC_ENABLE_CLERK_AUTH: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,

      // Next Auth
      NEXT_PUBLIC_ENABLE_NEXT_AUTH:
        !!process.env.NEXT_AUTH_SECRET || !!process.env.ENABLE_OAUTH_SSO,
      NEXT_AUTH_SSO_PROVIDERS: process.env.NEXT_AUTH_SSO_PROVIDERS || process.env.SSO_PROVIDERS,
      NEXT_AUTH_SECRET: process.env.NEXT_AUTH_SECRET,

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

      // ZITADEL
      ZITADEL_CLIENT_ID: process.env.ZITADEL_CLIENT_ID,
      ZITADEL_CLIENT_SECRET: process.env.ZITADEL_CLIENT_SECRET,
      ZITADEL_ISSUER: process.env.ZITADEL_ISSUER,
    },
  });
};

export const authEnv = getAuthConfig();
