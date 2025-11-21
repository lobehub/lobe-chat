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

      // ===== Better Auth ===== //
      BETTER_AUTH_SECRET?: string;
      NEXT_PUBLIC_BETTER_AUTH_URL?: string;
      NEXT_PUBLIC_BETTER_AUTH_REQUIRE_EMAIL_VERIFICATION?: string;
      BETTER_AUTH_SSO_PROVIDERS?: string;

      // ===== Google OAuth (Better Auth) ===== //
      GOOGLE_CLIENT_ID?: string;
      GOOGLE_CLIENT_SECRET?: string;

      // ===== Next Auth ===== //
      NEXT_AUTH_SECRET?: string;

      NEXT_AUTH_SSO_PROVIDERS?: string;

      NEXT_AUTH_DEBUG?: string;

      NEXT_AUTH_SSO_SESSION_STRATEGY?: string;

      // ===== Next Auth Provider Credentials ===== //
      AUTH_AUTH0_ID?: string;
      AUTH_AUTH0_SECRET?: string;
      AUTH_AUTH0_ISSUER?: string;

      AUTH_AUTHELIA_ID?: string;
      AUTH_AUTHELIA_SECRET?: string;
      AUTH_AUTHELIA_ISSUER?: string;

      AUTH_AUTHENTIK_ID?: string;
      AUTH_AUTHENTIK_SECRET?: string;
      AUTH_AUTHENTIK_ISSUER?: string;

      AUTH_CASDOOR_ID?: string;
      AUTH_CASDOOR_SECRET?: string;
      AUTH_CASDOOR_ISSUER?: string;

      AUTH_CLOUDFLARE_ZERO_TRUST_ID?: string;
      AUTH_CLOUDFLARE_ZERO_TRUST_SECRET?: string;
      AUTH_CLOUDFLARE_ZERO_TRUST_ISSUER?: string;

      AUTH_FEISHU_APP_ID?: string;
      AUTH_FEISHU_APP_SECRET?: string;

      AUTH_GENERIC_OIDC_ID?: string;
      AUTH_GENERIC_OIDC_SECRET?: string;
      AUTH_GENERIC_OIDC_ISSUER?: string;

      AUTH_KEYCLOAK_ID?: string;
      AUTH_KEYCLOAK_SECRET?: string;
      AUTH_KEYCLOAK_ISSUER?: string;

      AUTH_LOGTO_ID?: string;
      AUTH_LOGTO_SECRET?: string;
      AUTH_LOGTO_ISSUER?: string;

      AUTH_MICROSOFT_ENTRA_ID_ID?: string;
      AUTH_MICROSOFT_ENTRA_ID_SECRET?: string;
      AUTH_MICROSOFT_ENTRA_ID_TENANT_ID?: string;
      AUTH_MICROSOFT_ENTRA_ID_BASE_URL?: string;

      AUTH_OKTA_ID?: string;
      AUTH_OKTA_SECRET?: string;
      AUTH_OKTA_ISSUER?: string;

      AUTH_WECHAT_ID?: string;
      AUTH_WECHAT_SECRET?: string;

      AUTH_ZITADEL_ID?: string;
      AUTH_ZITADEL_SECRET?: string;
      AUTH_ZITADEL_ISSUER?: string;

      AUTH_AZURE_AD_ID?: string;
      AUTH_AZURE_AD_SECRET?: string;
      AUTH_AZURE_AD_TENANT_ID?: string;

      // Github
      GITHUB_CLIENT_ID?: string;
      GITHUB_CLIENT_SECRET?: string;

      // Azure AD
      AZURE_AD_CLIENT_ID?: string;
      AZURE_AD_CLIENT_SECRET?: string;
      AZURE_AD_TENANT_ID?: string;

      // ZITADEL
      ZITADEL_CLIENT_ID?: string;
      ZITADEL_CLIENT_SECRET?: string;
      ZITADEL_ISSUER?: string;
    }
  }
}

export const getAuthConfig = () => {
  return createEnv({
    client: {
      // ---------------------------------- clerk ----------------------------------
      NEXT_PUBLIC_ENABLE_CLERK_AUTH: z.boolean().optional().default(false),
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional(),

      // ---------------------------------- better auth ----------------------------------
      NEXT_PUBLIC_ENABLE_BETTER_AUTH: z.boolean().optional(),
      NEXT_PUBLIC_BETTER_AUTH_URL: z.string().optional(),
      NEXT_PUBLIC_BETTER_AUTH_REQUIRE_EMAIL_VERIFICATION: z.boolean().optional().default(false),

      // ---------------------------------- next auth ----------------------------------
      NEXT_PUBLIC_ENABLE_NEXT_AUTH: z.boolean().optional(),
    },
    server: {
      // ---------------------------------- clerk ----------------------------------
      CLERK_SECRET_KEY: z.string().optional(),
      CLERK_WEBHOOK_SECRET: z.string().optional(),

      // ---------------------------------- better auth ----------------------------------
      BETTER_AUTH_SECRET: z.string().optional(),
      BETTER_AUTH_SSO_PROVIDERS: z.string().optional().default(''),

      // Google OAuth
      GOOGLE_CLIENT_ID: z.string().optional(),
      GOOGLE_CLIENT_SECRET: z.string().optional(),

      // GitHub OAuth
      GITHUB_CLIENT_ID: z.string().optional(),
      GITHUB_CLIENT_SECRET: z.string().optional(),

      // AWS Cognito OAuth
      COGNITO_CLIENT_ID: z.string().optional(),
      COGNITO_CLIENT_SECRET: z.string().optional(),
      COGNITO_DOMAIN: z.string().optional(),
      COGNITO_REGION: z.string().optional(),
      COGNITO_USERPOOL_ID: z.string().optional(),

      // Microsoft OAuth
      MICROSOFT_CLIENT_ID: z.string().optional(),
      MICROSOFT_CLIENT_SECRET: z.string().optional(),

      // ---------------------------------- next auth ----------------------------------
      NEXT_AUTH_SECRET: z.string().optional(),
      NEXT_AUTH_SSO_PROVIDERS: z.string().optional().default('auth0'),
      NEXT_AUTH_DEBUG: z.boolean().optional().default(false),
      NEXT_AUTH_SSO_SESSION_STRATEGY: z.enum(['jwt', 'database']).optional().default('jwt'),

      AUTH_AUTH0_ID: z.string().optional(),
      AUTH_AUTH0_SECRET: z.string().optional(),
      AUTH_AUTH0_ISSUER: z.string().optional(),

      AUTH_AUTHELIA_ID: z.string().optional(),
      AUTH_AUTHELIA_SECRET: z.string().optional(),
      AUTH_AUTHELIA_ISSUER: z.string().optional(),

      AUTH_AUTHENTIK_ID: z.string().optional(),
      AUTH_AUTHENTIK_SECRET: z.string().optional(),
      AUTH_AUTHENTIK_ISSUER: z.string().optional(),

      AUTH_CASDOOR_ID: z.string().optional(),
      AUTH_CASDOOR_SECRET: z.string().optional(),
      AUTH_CASDOOR_ISSUER: z.string().optional(),

      AUTH_CLOUDFLARE_ZERO_TRUST_ID: z.string().optional(),
      AUTH_CLOUDFLARE_ZERO_TRUST_SECRET: z.string().optional(),
      AUTH_CLOUDFLARE_ZERO_TRUST_ISSUER: z.string().optional(),

      AUTH_FEISHU_APP_ID: z.string().optional(),
      AUTH_FEISHU_APP_SECRET: z.string().optional(),

      AUTH_GENERIC_OIDC_ID: z.string().optional(),
      AUTH_GENERIC_OIDC_SECRET: z.string().optional(),
      AUTH_GENERIC_OIDC_ISSUER: z.string().optional(),

      AUTH_KEYCLOAK_ID: z.string().optional(),
      AUTH_KEYCLOAK_SECRET: z.string().optional(),
      AUTH_KEYCLOAK_ISSUER: z.string().optional(),

      AUTH_LOGTO_ID: z.string().optional(),
      AUTH_LOGTO_SECRET: z.string().optional(),
      AUTH_LOGTO_ISSUER: z.string().optional(),

      AUTH_MICROSOFT_ENTRA_ID_ID: z.string().optional(),
      AUTH_MICROSOFT_ENTRA_ID_SECRET: z.string().optional(),
      AUTH_MICROSOFT_ENTRA_ID_TENANT_ID: z.string().optional(),
      AUTH_MICROSOFT_ENTRA_ID_BASE_URL: z.string().optional(),

      AUTH_OKTA_ID: z.string().optional(),
      AUTH_OKTA_SECRET: z.string().optional(),
      AUTH_OKTA_ISSUER: z.string().optional(),

      AUTH_WECHAT_ID: z.string().optional(),
      AUTH_WECHAT_SECRET: z.string().optional(),

      AUTH_ZITADEL_ID: z.string().optional(),
      AUTH_ZITADEL_SECRET: z.string().optional(),
      AUTH_ZITADEL_ISSUER: z.string().optional(),

      AUTH_AZURE_AD_ID: z.string().optional(),
      AUTH_AZURE_AD_SECRET: z.string().optional(),
      AUTH_AZURE_AD_TENANT_ID: z.string().optional(),

      ZITADEL_CLIENT_ID: z.string().optional(),
      ZITADEL_CLIENT_SECRET: z.string().optional(),
      ZITADEL_ISSUER: z.string().optional(),

      // Azure AD
      AZURE_AD_CLIENT_ID: z.string().optional(),
      AZURE_AD_CLIENT_SECRET: z.string().optional(),
      AZURE_AD_TENANT_ID: z.string().optional(),

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

      // ---------------------------------- better auth ----------------------------------
      NEXT_PUBLIC_ENABLE_BETTER_AUTH: process.env.NEXT_PUBLIC_ENABLE_BETTER_AUTH === '1',
      NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
      NEXT_PUBLIC_BETTER_AUTH_REQUIRE_EMAIL_VERIFICATION:
        process.env.NEXT_PUBLIC_BETTER_AUTH_REQUIRE_EMAIL_VERIFICATION === '1',
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
      BETTER_AUTH_SSO_PROVIDERS: process.env.BETTER_AUTH_SSO_PROVIDERS,

      // Google OAuth (Better Auth)
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,

      // GitHub OAuth (Better Auth)
      GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
      GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,

      // AWS Cognito OAuth (Better Auth)
      COGNITO_CLIENT_ID: process.env.COGNITO_CLIENT_ID,
      COGNITO_CLIENT_SECRET: process.env.COGNITO_CLIENT_SECRET,
      COGNITO_DOMAIN: process.env.COGNITO_DOMAIN,
      COGNITO_REGION: process.env.COGNITO_REGION,
      COGNITO_USERPOOL_ID: process.env.COGNITO_USERPOOL_ID,

      // Microsoft OAuth (Better Auth)
      MICROSOFT_CLIENT_ID: process.env.MICROSOFT_CLIENT_ID,
      MICROSOFT_CLIENT_SECRET: process.env.MICROSOFT_CLIENT_SECRET,

      // ---------------------------------- next auth ----------------------------------
      NEXT_PUBLIC_ENABLE_NEXT_AUTH: process.env.NEXT_PUBLIC_ENABLE_NEXT_AUTH === '1',
      NEXT_AUTH_SSO_PROVIDERS: process.env.NEXT_AUTH_SSO_PROVIDERS,
      NEXT_AUTH_SECRET: process.env.NEXT_AUTH_SECRET,
      NEXT_AUTH_DEBUG: !!process.env.NEXT_AUTH_DEBUG,
      NEXT_AUTH_SSO_SESSION_STRATEGY: process.env.NEXT_AUTH_SSO_SESSION_STRATEGY || 'jwt',

      // Next Auth Provider Credentials
      AUTH_AUTH0_ID: process.env.AUTH_AUTH0_ID,
      AUTH_AUTH0_SECRET: process.env.AUTH_AUTH0_SECRET,
      AUTH_AUTH0_ISSUER: process.env.AUTH_AUTH0_ISSUER,

      AUTH_AUTHELIA_ID: process.env.AUTH_AUTHELIA_ID,
      AUTH_AUTHELIA_SECRET: process.env.AUTH_AUTHELIA_SECRET,
      AUTH_AUTHELIA_ISSUER: process.env.AUTH_AUTHELIA_ISSUER,

      AUTH_AUTHENTIK_ID: process.env.AUTH_AUTHENTIK_ID,
      AUTH_AUTHENTIK_SECRET: process.env.AUTH_AUTHENTIK_SECRET,
      AUTH_AUTHENTIK_ISSUER: process.env.AUTH_AUTHENTIK_ISSUER,

      AUTH_CASDOOR_ID: process.env.AUTH_CASDOOR_ID,
      AUTH_CASDOOR_SECRET: process.env.AUTH_CASDOOR_SECRET,
      AUTH_CASDOOR_ISSUER: process.env.AUTH_CASDOOR_ISSUER,

      AUTH_CLOUDFLARE_ZERO_TRUST_ID: process.env.AUTH_CLOUDFLARE_ZERO_TRUST_ID,
      AUTH_CLOUDFLARE_ZERO_TRUST_SECRET: process.env.AUTH_CLOUDFLARE_ZERO_TRUST_SECRET,
      AUTH_CLOUDFLARE_ZERO_TRUST_ISSUER: process.env.AUTH_CLOUDFLARE_ZERO_TRUST_ISSUER,

      AUTH_FEISHU_APP_ID: process.env.AUTH_FEISHU_APP_ID,
      AUTH_FEISHU_APP_SECRET: process.env.AUTH_FEISHU_APP_SECRET,

      AUTH_GENERIC_OIDC_ID: process.env.AUTH_GENERIC_OIDC_ID,
      AUTH_GENERIC_OIDC_SECRET: process.env.AUTH_GENERIC_OIDC_SECRET,
      AUTH_GENERIC_OIDC_ISSUER: process.env.AUTH_GENERIC_OIDC_ISSUER,

      AUTH_KEYCLOAK_ID: process.env.AUTH_KEYCLOAK_ID,
      AUTH_KEYCLOAK_SECRET: process.env.AUTH_KEYCLOAK_SECRET,
      AUTH_KEYCLOAK_ISSUER: process.env.AUTH_KEYCLOAK_ISSUER,

      AUTH_LOGTO_ID: process.env.AUTH_LOGTO_ID,
      AUTH_LOGTO_SECRET: process.env.AUTH_LOGTO_SECRET,
      AUTH_LOGTO_ISSUER: process.env.AUTH_LOGTO_ISSUER,

      AUTH_MICROSOFT_ENTRA_ID_ID: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      AUTH_MICROSOFT_ENTRA_ID_SECRET: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      AUTH_MICROSOFT_ENTRA_ID_TENANT_ID: process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID,
      AUTH_MICROSOFT_ENTRA_ID_BASE_URL: process.env.AUTH_MICROSOFT_ENTRA_ID_BASE_URL,

      AUTH_OKTA_ID: process.env.AUTH_OKTA_ID,
      AUTH_OKTA_SECRET: process.env.AUTH_OKTA_SECRET,
      AUTH_OKTA_ISSUER: process.env.AUTH_OKTA_ISSUER,

      AUTH_WECHAT_ID: process.env.AUTH_WECHAT_ID,
      AUTH_WECHAT_SECRET: process.env.AUTH_WECHAT_SECRET,

      AUTH_ZITADEL_ID: process.env.AUTH_ZITADEL_ID,
      AUTH_ZITADEL_SECRET: process.env.AUTH_ZITADEL_SECRET,
      AUTH_ZITADEL_ISSUER: process.env.AUTH_ZITADEL_ISSUER,

      AUTH_AZURE_AD_ID: process.env.AUTH_AZURE_AD_ID,
      AUTH_AZURE_AD_SECRET: process.env.AUTH_AZURE_AD_SECRET,
      AUTH_AZURE_AD_TENANT_ID: process.env.AUTH_AZURE_AD_TENANT_ID,

      ZITADEL_CLIENT_ID: process.env.ZITADEL_CLIENT_ID,
      ZITADEL_CLIENT_SECRET: process.env.ZITADEL_CLIENT_SECRET,
      ZITADEL_ISSUER: process.env.ZITADEL_ISSUER,

      // Azure AD
      AZURE_AD_CLIENT_ID: process.env.AZURE_AD_CLIENT_ID,
      AZURE_AD_CLIENT_SECRET: process.env.AZURE_AD_CLIENT_SECRET,
      AZURE_AD_TENANT_ID: process.env.AZURE_AD_TENANT_ID,

      // LOGTO
      LOGTO_WEBHOOK_SIGNING_KEY: process.env.LOGTO_WEBHOOK_SIGNING_KEY,

      // Casdoor
      CASDOOR_WEBHOOK_SECRET: process.env.CASDOOR_WEBHOOK_SECRET,
    },
  });
};

export const authEnv = getAuthConfig();
