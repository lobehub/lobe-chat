// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getAuthConfig } from '../auth';

// Stub the global process object to safely mock environment variables
vi.stubGlobal('process', {
  ...process, // Preserve the original process object
  env: { ...process.env }, // Clone the environment variables object for modification
});

const spyConsoleWarn = vi.spyOn(console, 'warn');

describe('getAuthConfig', () => {
  beforeEach(() => {
    // Clear all environment variables before each test
    // @ts-expect-error
    process.env = {};
  });

  // TODO(NextAuth ENVs Migration): Remove once nextauth envs migration time end
  describe('should warn about deprecated environment variables', () => {
    it('should warn about Auth0 deprecated environment variables', () => {
      // Set all deprecated environment variables
      process.env.AUTH0_CLIENT_ID = 'auth0_client_id';
      process.env.AUTH0_CLIENT_SECRET = 'auth0_client_secret';
      process.env.AUTH0_ISSUER = 'auth0_issuer';
      // Call the function
      getAuthConfig();

      // Check that the spyConsoleWarn function was called for each deprecated environment variable
      // Example: A warning meassage should incloud: `<Old Env> .* <New Env>`
      // And the regex should match the warning message: `AUTH0_CLIENT_ID.*AUTH_AUTH0_ID`
      expect(spyConsoleWarn).toHaveBeenCalledWith(
        expect.stringMatching(/AUTH0_CLIENT_ID.*AUTH_AUTH0_ID/),
      );
      expect(spyConsoleWarn).toHaveBeenCalledWith(
        expect.stringMatching(/AUTH0_CLIENT_SECRET.*AUTH_AUTH0_SECRET/),
      );
      expect(spyConsoleWarn).toHaveBeenCalledWith(
        expect.stringMatching(/AUTH0_ISSUER.*AUTH_AUTH0_ISSUER/),
      );
    });
    it('should warn about Authentik deprecated environment variables', () => {
      // Set all deprecated environment variables
      process.env.AUTHENTIK_CLIENT_ID = 'authentik_client_id';
      process.env.AUTHENTIK_CLIENT_SECRET = 'authentik_client_secret';
      process.env.AUTHENTIK_ISSUER = 'authentik_issuer';

      // Call the function
      getAuthConfig();

      // Check that the spyConsoleWarn function was called for each deprecated environment variable
      expect(spyConsoleWarn).toHaveBeenCalledWith(
        expect.stringMatching(/AUTHENTIK_CLIENT_ID.*AUTH_AUTHENTIK_ID/),
      );
      expect(spyConsoleWarn).toHaveBeenCalledWith(
        expect.stringMatching(/AUTHENTIK_CLIENT_SECRET.*AUTH_AUTHENTIK_SECRET/),
      );
      expect(spyConsoleWarn).toHaveBeenCalledWith(
        expect.stringMatching(/AUTHENTIK_ISSUER.*AUTH_AUTHENTIK_ISSUER/),
      );
    });
    it('should warn about Authelia deprecated environment variables', () => {
      // Set all deprecated environment variables
      process.env.AUTHELIA_CLIENT_ID = 'authelia_client_id';
      process.env.AUTHELIA_CLIENT_SECRET = 'authelia_client_secret';
      process.env.AUTHELIA_ISSUER = 'authelia_issuer';

      // Call the function
      getAuthConfig();

      // Check that the spyConsoleWarn function was called for each deprecated environment variable
      expect(spyConsoleWarn).toHaveBeenCalledWith(
        expect.stringMatching(/AUTHELIA_CLIENT_ID.*AUTH_AUTHELIA_ID/),
      );
      expect(spyConsoleWarn).toHaveBeenCalledWith(
        expect.stringMatching(/AUTHELIA_CLIENT_SECRET.*AUTH_AUTHELIA_SECRET/),
      );
      expect(spyConsoleWarn).toHaveBeenCalledWith(
        expect.stringMatching(/AUTHELIA_ISSUER.*AUTH_AUTHELIA_ISSUER/),
      );
    });
    it('should warn about AzureAD deprecated environment variables', () => {
      // Set all deprecated environment variables
      process.env.AZURE_AD_CLIENT_ID = 'azure_ad_client_id';
      process.env.AZURE_AD_CLIENT_SECRET = 'azure_ad_client_secret';
      process.env.AZURE_AD_TENANT_ID = 'azure_ad_tenant_id';

      // Call the function
      getAuthConfig();

      // Check that the spyConsoleWarn function was called for each deprecated environment variable
      expect(spyConsoleWarn).toHaveBeenCalledWith(
        expect.stringMatching(/AZURE_AD_CLIENT_ID.*AUTH_AZURE_AD_ID/),
      );
      expect(spyConsoleWarn).toHaveBeenCalledWith(
        expect.stringMatching(/AZURE_AD_CLIENT_SECRET.*AUTH_AZURE_AD_SECRET/),
      );
      expect(spyConsoleWarn).toHaveBeenCalledWith(
        expect.stringMatching(/AZURE_AD_TENANT_ID.*AUTH_AZURE_AD_TENANT_ID/),
      );
    });
    it('should warn about Cloudflare Zero Trust deprecated environment variables', () => {
      // Set all deprecated environment variables
      process.env.CLOUDFLARE_ZERO_TRUST_CLIENT_ID = 'cloudflare_zero_trust_client_id';
      process.env.CLOUDFLARE_ZERO_TRUST_CLIENT_SECRET = 'cloudflare_zero_trust_client_secret';
      process.env.CLOUDFLARE_ZERO_TRUST_ISSUER = 'cloudflare_zero_trust_issuer';

      // Call the function
      getAuthConfig();

      // Check that the spyConsoleWarn function was called for each deprecated environment variable
      expect(spyConsoleWarn).toHaveBeenCalledWith(
        expect.stringMatching(/CLOUDFLARE_ZERO_TRUST_CLIENT_ID.*AUTH_CLOUDFLARE_ZERO_TRUST_ID/),
      );
      expect(spyConsoleWarn).toHaveBeenCalledWith(
        expect.stringMatching(
          /CLOUDFLARE_ZERO_TRUST_CLIENT_SECRET.*AUTH_CLOUDFLARE_ZERO_TRUST_SECRET/,
        ),
      );
      expect(spyConsoleWarn).toHaveBeenCalledWith(
        expect.stringMatching(/CLOUDFLARE_ZERO_TRUST_ISSUER.*AUTH_CLOUDFLARE_ZERO_TRUST_ISSUER/),
      );
    });
    it('should warn about Generic OIDC deprecated environment variables', () => {
      // Set all deprecated environment variables
      process.env.GENERIC_OIDC_CLIENT_ID = 'generic_oidc_client_id';
      process.env.GENERIC_OIDC_CLIENT_SECRET = 'generic_oidc_client_secret';
      process.env.GENERIC_OIDC_ISSUER = 'generic_oidc_issuer';
      // Call the function
      getAuthConfig();

      // Check that the spyConsoleWarn function was called for each deprecated environment variable
      expect(spyConsoleWarn).toHaveBeenCalledWith(
        expect.stringMatching(/GENERIC_OIDC_CLIENT_ID.*AUTH_GENERIC_OIDC_ID/),
      );
      expect(spyConsoleWarn).toHaveBeenCalledWith(
        expect.stringMatching(/GENERIC_OIDC_CLIENT_SECRET.*AUTH_GENERIC_OIDC_SECRET/),
      );
      expect(spyConsoleWarn).toHaveBeenCalledWith(
        expect.stringMatching(/GENERIC_OIDC_ISSUER.*AUTH_GENERIC_OIDC_ISSUER/),
      );
    });
    it('should warn about GitHub deprecated environment variables', () => {
      // Set all deprecated environment variables
      process.env.GITHUB_CLIENT_ID = 'github_client_id';
      process.env.GITHUB_CLIENT_SECRET = 'github_client_secret';
      // Call the function
      getAuthConfig();

      // Check that the spyConsoleWarn function was called for each deprecated environment variable
      expect(spyConsoleWarn).toHaveBeenCalledWith(
        expect.stringMatching(/GITHUB_CLIENT_ID.*AUTH_GITHUB_ID/),
      );
      expect(spyConsoleWarn).toHaveBeenCalledWith(
        expect.stringMatching(/GITHUB_CLIENT_SECRET.*AUTH_GITHUB_SECRET/),
      );
    });
    it('should warn about Logto deprecated environment variables', () => {
      // Set all deprecated environment variables
      process.env.LOGTO_CLIENT_ID = 'logto_client_id';
      process.env.LOGTO_CLIENT_SECRET = 'logto_client_secret';
      process.env.LOGTO_ISSUER = 'logto_issuer';
      // Call the function
      getAuthConfig();

      // Check that the spyConsoleWarn function was called for each deprecated environment variable
      expect(spyConsoleWarn).toHaveBeenCalledWith(
        expect.stringMatching(/LOGTO_CLIENT_ID.*AUTH_LOGTO_ID/),
      );
      expect(spyConsoleWarn).toHaveBeenCalledWith(
        expect.stringMatching(/LOGTO_CLIENT_SECRET.*AUTH_LOGTO_SECRET/),
      );
      expect(spyConsoleWarn).toHaveBeenCalledWith(
        expect.stringMatching(/LOGTO_ISSUER.*AUTH_LOGTO_ISSUER/),
      );
    });
    it('should warn about Zitadel deprecated environment variables', () => {
      // Set all deprecated environment variables
      process.env.ZITADEL_CLIENT_ID = 'zitadel_client_id';
      process.env.ZITADEL_CLIENT_SECRET = 'zitadel_client_secret';
      process.env.ZITADEL_ISSUER = 'zitadel_issuer';
      // Call the function
      getAuthConfig();

      // Check that the spyConsoleWarn function was called for each deprecated environment variable
      expect(spyConsoleWarn).toHaveBeenCalledWith(
        expect.stringMatching(/ZITADEL_CLIENT_ID.*AUTH_ZITADEL_ID/),
      );
      expect(spyConsoleWarn).toHaveBeenCalledWith(
        expect.stringMatching(/ZITADEL_CLIENT_SECRET.*AUTH_ZITADEL_SECRET/),
      );
      expect(spyConsoleWarn).toHaveBeenCalledWith(
        expect.stringMatching(/ZITADEL_ISSUER.*AUTH_ZITADEL_ISSUER/),
      );
    });
  });
  // Remove end
});
