import { describe, expect, it, vi } from 'vitest';

import { defaultClaims, defaultClients, defaultScopes } from '../config';

// Mock environment variables
vi.mock('@/envs/app', () => ({
  appEnv: {
    APP_URL: 'https://test.example.com',
  },
}));

describe('OIDC Provider Config', () => {
  describe('defaultClients', () => {
    it('should have correct client configuration for lobehub-desktop', () => {
      const client = defaultClients.find((c) => c.client_id === 'lobehub-desktop');

      expect(client).toBeDefined();
      expect(client).toMatchObject({
        application_type: 'web',
        client_id: 'lobehub-desktop',
        client_name: 'LobeHub Desktop',
        grant_types: ['authorization_code', 'refresh_token'],
        response_types: ['code'],
        token_endpoint_auth_method: 'none',
      });
    });

    it('should have correct redirect URIs with dynamic APP_URL', () => {
      const client = defaultClients[0];

      expect(client.redirect_uris).toEqual([
        'https://test.example.com/oidc/callback/desktop',
        'http://localhost:3210/oidc/callback/desktop',
      ]);
    });

    it('should have correct post logout redirect URIs', () => {
      const client = defaultClients[0];

      expect(client.post_logout_redirect_uris).toEqual([
        'https://test.example.com/oauth/logout',
        'http://localhost:3210/oauth/logout',
      ]);
    });

    it('should have valid logo URI', () => {
      const client = defaultClients[0];

      expect(client.logo_uri).toBe('https://hub-apac-1.lobeobjects.space/lobehub-desktop-icon.png');
    });
  });

  describe('defaultScopes', () => {
    it('should contain required OIDC scopes', () => {
      expect(defaultScopes).toEqual(['openid', 'profile', 'email', 'offline_access']);
    });

    it('should include openid as the first scope', () => {
      expect(defaultScopes[0]).toBe('openid');
    });

    it('should include offline_access for refresh token support', () => {
      expect(defaultScopes).toContain('offline_access');
    });
  });

  describe('defaultClaims', () => {
    it('should have correct openid claims', () => {
      expect(defaultClaims.openid).toEqual(['sub']);
    });

    it('should have correct profile claims', () => {
      expect(defaultClaims.profile).toEqual(['name', 'picture']);
    });

    it('should have correct email claims', () => {
      expect(defaultClaims.email).toEqual(['email', 'email_verified']);
    });

    it('should map all required OIDC claim types', () => {
      expect(defaultClaims).toHaveProperty('openid');
      expect(defaultClaims).toHaveProperty('profile');
      expect(defaultClaims).toHaveProperty('email');
    });
  });
});