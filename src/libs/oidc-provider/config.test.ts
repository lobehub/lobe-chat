/**
 * @vitest-environment node
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the appEnv module
vi.mock('@/envs/app', () => ({
  appEnv: {
    APP_URL: 'https://example.com',
    MARKET_BASE_URL: undefined,
  },
}));

describe('OIDC Provider Config', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe('defaultClients', () => {
    it('should have three default clients configured', async () => {
      const { defaultClients } = await import('./config');
      expect(defaultClients).toHaveLength(3);
      expect(defaultClients.map((c) => c.client_id)).toEqual([
        'lobehub-desktop',
        'lobehub-mobile',
        'lobehub-market',
      ]);
    });

    describe('lobehub-desktop client', () => {
      it('should be configured as web application type', async () => {
        const { defaultClients } = await import('./config');
        const desktopClient = defaultClients.find((c) => c.client_id === 'lobehub-desktop');
        expect(desktopClient?.application_type).toBe('web');
      });

      it('should support authorization_code and refresh_token grant types', async () => {
        const { defaultClients } = await import('./config');
        const desktopClient = defaultClients.find((c) => c.client_id === 'lobehub-desktop');
        expect(desktopClient?.grant_types).toEqual(['authorization_code', 'refresh_token']);
      });

      it('should use code response type', async () => {
        const { defaultClients } = await import('./config');
        const desktopClient = defaultClients.find((c) => c.client_id === 'lobehub-desktop');
        expect(desktopClient?.response_types).toEqual(['code']);
      });

      it('should be a public client without token endpoint auth', async () => {
        const { defaultClients } = await import('./config');
        const desktopClient = defaultClients.find((c) => c.client_id === 'lobehub-desktop');
        expect(desktopClient?.token_endpoint_auth_method).toBe('none');
      });

      it('should have correct redirect URIs for desktop', async () => {
        const { defaultClients } = await import('./config');
        const desktopClient = defaultClients.find((c) => c.client_id === 'lobehub-desktop');
        expect(desktopClient?.redirect_uris).toContain(
          'http://localhost:3210/oidc/callback/desktop',
        );
        expect(desktopClient?.redirect_uris?.length).toBeGreaterThanOrEqual(1);
      });

      it('should have correct post logout redirect URIs', async () => {
        const { defaultClients } = await import('./config');
        const desktopClient = defaultClients.find((c) => c.client_id === 'lobehub-desktop');
        expect(desktopClient?.post_logout_redirect_uris).toContain(
          'http://localhost:3210/oauth/logout',
        );
        expect(desktopClient?.post_logout_redirect_uris?.length).toBeGreaterThanOrEqual(1);
      });
    });

    describe('lobehub-mobile client', () => {
      it('should be configured as native application type', async () => {
        const { defaultClients } = await import('./config');
        const mobileClient = defaultClients.find((c) => c.client_id === 'lobehub-mobile');
        expect(mobileClient?.application_type).toBe('native');
      });

      it('should support authorization_code and refresh_token grant types', async () => {
        const { defaultClients } = await import('./config');
        const mobileClient = defaultClients.find((c) => c.client_id === 'lobehub-mobile');
        expect(mobileClient?.grant_types).toEqual(['authorization_code', 'refresh_token']);
      });

      it('should use custom URL scheme for redirect URIs', async () => {
        const { defaultClients } = await import('./config');
        const mobileClient = defaultClients.find((c) => c.client_id === 'lobehub-mobile');
        expect(mobileClient?.redirect_uris).toEqual(['com.lobehub.app://auth/callback']);
      });

      it('should have empty post logout redirect URIs', async () => {
        const { defaultClients } = await import('./config');
        const mobileClient = defaultClients.find((c) => c.client_id === 'lobehub-mobile');
        expect(mobileClient?.post_logout_redirect_uris).toEqual([]);
      });

      it('should be a public client without token endpoint auth', async () => {
        const { defaultClients } = await import('./config');
        const mobileClient = defaultClients.find((c) => c.client_id === 'lobehub-mobile');
        expect(mobileClient?.token_endpoint_auth_method).toBe('none');
      });
    });

    describe('lobehub-market client', () => {
      it('should be configured as web application type', async () => {
        const { defaultClients } = await import('./config');
        const marketClient = defaultClients.find((c) => c.client_id === 'lobehub-market');
        expect(marketClient?.application_type).toBe('web');
      });

      it('should support authorization_code and refresh_token grant types', async () => {
        const { defaultClients } = await import('./config');
        const marketClient = defaultClients.find((c) => c.client_id === 'lobehub-market');
        expect(marketClient?.grant_types).toEqual(['authorization_code', 'refresh_token']);
      });

      it('should use code response type', async () => {
        const { defaultClients } = await import('./config');
        const marketClient = defaultClients.find((c) => c.client_id === 'lobehub-market');
        expect(marketClient?.response_types).toEqual(['code']);
      });

      it('should be a public client without token endpoint auth', async () => {
        const { defaultClients } = await import('./config');
        const marketClient = defaultClients.find((c) => c.client_id === 'lobehub-market');
        expect(marketClient?.token_endpoint_auth_method).toBe('none');
      });
    });

    describe('market client URIs with MARKET_BASE_URL', () => {
      it('should use default market base URL when env is not set', async () => {
        vi.doMock('@/envs/app', () => ({
          appEnv: {
            APP_URL: 'https://example.com',
            MARKET_BASE_URL: undefined,
          },
        }));

        const { defaultClients: clients } = await import('./config');
        const marketClient = clients.find((c) => c.client_id === 'lobehub-market');

        expect(marketClient?.redirect_uris).toContain(
          'https://market.lobehub.com/lobehub-oidc/consent/callback',
        );
        expect(marketClient?.redirect_uris).toContain(
          'http://localhost:8787/lobehub-oidc/consent/callback',
        );
        expect(marketClient?.post_logout_redirect_uris).toContain(
          'https://market.lobehub.com/lobehub-oidc/logout',
        );
        expect(marketClient?.post_logout_redirect_uris).toContain(
          'http://localhost:8787/lobehub-oidc/logout',
        );

        vi.doUnmock('@/envs/app');
      });

      it('should use custom market base URL from env', async () => {
        vi.doMock('@/envs/app', () => ({
          appEnv: {
            APP_URL: 'https://example.com',
            MARKET_BASE_URL: 'https://custom-market.example.com',
          },
        }));

        const { defaultClients: clients } = await import('./config');
        const marketClient = clients.find((c) => c.client_id === 'lobehub-market');

        expect(marketClient?.redirect_uris).toContain(
          'https://custom-market.example.com/lobehub-oidc/consent/callback',
        );
        expect(marketClient?.redirect_uris).toContain(
          'http://localhost:8787/lobehub-oidc/consent/callback',
        );
        expect(marketClient?.post_logout_redirect_uris).toContain(
          'https://custom-market.example.com/lobehub-oidc/logout',
        );
        expect(marketClient?.post_logout_redirect_uris).toContain(
          'http://localhost:8787/lobehub-oidc/logout',
        );

        vi.doUnmock('@/envs/app');
      });

      it('should extract origin from full URL with path', async () => {
        vi.doMock('@/envs/app', () => ({
          appEnv: {
            APP_URL: 'https://example.com',
            MARKET_BASE_URL: 'https://example.com:8080/some/path',
          },
        }));

        const { defaultClients: clients } = await import('./config');
        const marketClient = clients.find((c) => c.client_id === 'lobehub-market');

        // Should use origin only (protocol + host), not the path
        expect(marketClient?.redirect_uris).toContain(
          'https://example.com:8080/lobehub-oidc/consent/callback',
        );
        expect(marketClient?.post_logout_redirect_uris).toContain(
          'https://example.com:8080/lobehub-oidc/logout',
        );

        vi.doUnmock('@/envs/app');
      });

      it('should handle market base URL with non-standard port', async () => {
        vi.doMock('@/envs/app', () => ({
          appEnv: {
            APP_URL: 'https://example.com',
            MARKET_BASE_URL: 'https://market.example.com:8443',
          },
        }));

        const { defaultClients: clients } = await import('./config');
        const marketClient = clients.find((c) => c.client_id === 'lobehub-market');

        expect(marketClient?.redirect_uris).toContain(
          'https://market.example.com:8443/lobehub-oidc/consent/callback',
        );
        expect(marketClient?.post_logout_redirect_uris).toContain(
          'https://market.example.com:8443/lobehub-oidc/logout',
        );

        vi.doUnmock('@/envs/app');
      });

      it('should handle market base URL with http protocol', async () => {
        vi.doMock('@/envs/app', () => ({
          appEnv: {
            APP_URL: 'https://example.com',
            MARKET_BASE_URL: 'http://localhost:3000',
          },
        }));

        const { defaultClients: clients } = await import('./config');
        const marketClient = clients.find((c) => c.client_id === 'lobehub-market');

        expect(marketClient?.redirect_uris).toContain(
          'http://localhost:3000/lobehub-oidc/consent/callback',
        );
        expect(marketClient?.post_logout_redirect_uris).toContain(
          'http://localhost:3000/lobehub-oidc/logout',
        );

        vi.doUnmock('@/envs/app');
      });

      it('should normalize market base URL by removing trailing slash', async () => {
        vi.doMock('@/envs/app', () => ({
          appEnv: {
            APP_URL: 'https://example.com',
            MARKET_BASE_URL: 'https://market.example.com/',
          },
        }));

        const { defaultClients: clients } = await import('./config');
        const marketClient = clients.find((c) => c.client_id === 'lobehub-market');

        // urlJoin should handle this correctly
        expect(marketClient?.redirect_uris).toContain(
          'https://market.example.com/lobehub-oidc/consent/callback',
        );
        expect(marketClient?.post_logout_redirect_uris).toContain(
          'https://market.example.com/lobehub-oidc/logout',
        );

        vi.doUnmock('@/envs/app');
      });

      it('should always include localhost URIs for development', async () => {
        vi.doMock('@/envs/app', () => ({
          appEnv: {
            APP_URL: 'https://example.com',
            MARKET_BASE_URL: 'https://production-market.com',
          },
        }));

        const { defaultClients: clients } = await import('./config');
        const marketClient = clients.find((c) => c.client_id === 'lobehub-market');

        // Should have both production and localhost URIs
        expect(marketClient?.redirect_uris).toHaveLength(2);
        expect(marketClient?.redirect_uris).toContain(
          'http://localhost:8787/lobehub-oidc/consent/callback',
        );
        expect(marketClient?.post_logout_redirect_uris).toHaveLength(2);
        expect(marketClient?.post_logout_redirect_uris).toContain(
          'http://localhost:8787/lobehub-oidc/logout',
        );

        vi.doUnmock('@/envs/app');
      });
    });
  });

  describe('defaultScopes', () => {
    it('should include standard OpenID Connect scopes', async () => {
      vi.doMock('@/envs/app', () => ({
        appEnv: {
          APP_URL: 'https://example.com',
          MARKET_BASE_URL: undefined,
        },
      }));

      const { defaultScopes } = await import('./config');
      expect(defaultScopes).toContain('openid');
      expect(defaultScopes).toContain('profile');
      expect(defaultScopes).toContain('email');

      vi.doUnmock('@/envs/app');
    });

    it('should include offline_access for refresh tokens', async () => {
      vi.doMock('@/envs/app', () => ({
        appEnv: {
          APP_URL: 'https://example.com',
          MARKET_BASE_URL: undefined,
        },
      }));

      const { defaultScopes } = await import('./config');
      expect(defaultScopes).toContain('offline_access');

      vi.doUnmock('@/envs/app');
    });

    it('should have exactly 4 scopes', async () => {
      vi.doMock('@/envs/app', () => ({
        appEnv: {
          APP_URL: 'https://example.com',
          MARKET_BASE_URL: undefined,
        },
      }));

      const { defaultScopes } = await import('./config');
      expect(defaultScopes).toHaveLength(4);

      vi.doUnmock('@/envs/app');
    });
  });

  describe('defaultClaims', () => {
    it('should map openid scope to sub claim', async () => {
      vi.doMock('@/envs/app', () => ({
        appEnv: {
          APP_URL: 'https://example.com',
          MARKET_BASE_URL: undefined,
        },
      }));

      const { defaultClaims } = await import('./config');
      expect(defaultClaims.openid).toEqual(['sub']);

      vi.doUnmock('@/envs/app');
    });

    it('should map profile scope to name and picture claims', async () => {
      vi.doMock('@/envs/app', () => ({
        appEnv: {
          APP_URL: 'https://example.com',
          MARKET_BASE_URL: undefined,
        },
      }));

      const { defaultClaims } = await import('./config');
      expect(defaultClaims.profile).toContain('name');
      expect(defaultClaims.profile).toContain('picture');

      vi.doUnmock('@/envs/app');
    });

    it('should map email scope to email and email_verified claims', async () => {
      vi.doMock('@/envs/app', () => ({
        appEnv: {
          APP_URL: 'https://example.com',
          MARKET_BASE_URL: undefined,
        },
      }));

      const { defaultClaims } = await import('./config');
      expect(defaultClaims.email).toContain('email');
      expect(defaultClaims.email).toContain('email_verified');

      vi.doUnmock('@/envs/app');
    });

    it('should have exactly 3 scope mappings', async () => {
      vi.doMock('@/envs/app', () => ({
        appEnv: {
          APP_URL: 'https://example.com',
          MARKET_BASE_URL: undefined,
        },
      }));

      const { defaultClaims } = await import('./config');
      expect(Object.keys(defaultClaims)).toHaveLength(3);

      vi.doUnmock('@/envs/app');
    });
  });

  describe('security considerations', () => {
    it('should use PKCE-compatible settings for public clients', async () => {
      vi.doMock('@/envs/app', () => ({
        appEnv: {
          APP_URL: 'https://example.com',
          MARKET_BASE_URL: undefined,
        },
      }));

      const { defaultClients } = await import('./config');
      // All clients should be public (token_endpoint_auth_method: 'none')
      // and use authorization_code flow
      defaultClients.forEach((client) => {
        expect(client.token_endpoint_auth_method).toBe('none');
        expect(client.grant_types).toContain('authorization_code');
      });

      vi.doUnmock('@/envs/app');
    });

    it('should not expose client secrets for public clients', async () => {
      vi.doMock('@/envs/app', () => ({
        appEnv: {
          APP_URL: 'https://example.com',
          MARKET_BASE_URL: undefined,
        },
      }));

      const { defaultClients } = await import('./config');
      defaultClients.forEach((client) => {
        expect(client).not.toHaveProperty('client_secret');
      });

      vi.doUnmock('@/envs/app');
    });

    it('should use https for production redirect URIs', async () => {
      vi.doMock('@/envs/app', () => ({
        appEnv: {
          APP_URL: 'https://example.com',
          MARKET_BASE_URL: undefined,
        },
      }));

      const { defaultClients } = await import('./config');
      const marketClient = defaultClients.find((c) => c.client_id === 'lobehub-market');
      const productionUris = marketClient?.redirect_uris?.filter(
        (uri) => !uri.includes('localhost'),
      );

      productionUris?.forEach((uri) => {
        expect(uri).toMatch(/^https:\/\//);
      });

      vi.doUnmock('@/envs/app');
    });
  });
});
