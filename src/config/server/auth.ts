/* eslint-disable sort-keys-fix/sort-keys-fix , typescript-sort-keys/interface */

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      ENABLE_OAUTH_SSO?: string;
      SSO_PROVIDERS?: string;

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
      NEXTAUTH_SECRET?: string;
    }
  }
}

export const getAuthConfig = () => {
  if (typeof process === 'undefined') {
    throw new Error('[Server Config] you are importing a server-only module outside of server');
  }

  return {
    ENABLE_OAUTH_SSO: !!process.env.ENABLE_OAUTH_SSO,
    SSO_PROVIDERS: process.env.SSO_PROVIDERS || 'auth0',

    // Auth0
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID || '',
    AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET || '',
    AUTH0_ISSUER: process.env.AUTH0_ISSUER || '',

    // Github
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || '',
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || '',

    // Azure AD
    AZURE_AD_CLIENT_ID: process.env.AZURE_AD_CLIENT_ID || '',
    AZURE_AD_CLIENT_SECRET: process.env.AZURE_AD_CLIENT_SECRET || '',
    AZURE_AD_TENANT_ID: process.env.AZURE_AD_TENANT_ID || '',

    // AUTHENTIK
    AUTHENTIK_CLIENT_ID: process.env.AUTHENTIK_CLIENT_ID || '',
    AUTHENTIK_CLIENT_SECRET: process.env.AUTHENTIK_CLIENT_SECRET || '',
    AUTHENTIK_ISSUER: process.env.AUTHENTIK_ISSUER || '',

    // ZITADEL
    ZITADEL_CLIENT_ID: process.env.ZITADEL_CLIENT_ID || '',
    ZITADEL_CLIENT_SECRET: process.env.ZITADEL_CLIENT_SECRET || '',
    ZITADEL_ISSUER: process.env.ZITADEL_ISSUER || '',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
  };
};
