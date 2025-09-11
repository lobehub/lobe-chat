import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { getJWKS, validateOIDCJWT } from '../jwt';

// Mock debug
vi.mock('debug', () => ({
  default: () => vi.fn(),
}));

// Mock OIDC environment
vi.mock('@/envs/oidc', () => ({
  oidcEnv: {
    OIDC_JWKS_KEY: JSON.stringify({
      keys: [
        {
          alg: 'RS256',
          e: 'AQAB',
          kid: 'test-key-id',
          kty: 'RSA',
          n: 'test-n-value',
          use: 'sig',
        },
      ],
    }),
  },
}));

// Mock JOSE functions
vi.mock('jose', () => ({
  importJWK: vi.fn(),
  jwtVerify: vi.fn(),
}));

describe('OIDC JWT', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getJWKS', () => {
    it('should return parsed JWKS from environment variable', () => {
      const result = getJWKS();

      expect(result).toHaveProperty('keys');
      expect(result.keys).toHaveLength(1);
      expect(result.keys[0]).toMatchObject({
        alg: 'RS256',
        kty: 'RSA',
      });
    });

    it('should validate JWKS structure', () => {
      const result = getJWKS();

      expect(result.keys[0]).toHaveProperty('alg', 'RS256');
      expect(result.keys[0]).toHaveProperty('kty', 'RSA');
      expect(result.keys[0]).toHaveProperty('e', 'AQAB');
      expect(result.keys[0]).toHaveProperty('n', 'test-n-value');
      expect(result.keys[0]).toHaveProperty('kid', 'test-key-id');
    });
  });

  describe('validateOIDCJWT', () => {
    it('should be a function that validates JWT tokens', () => {
      expect(typeof validateOIDCJWT).toBe('function');
    });

    it('should handle JWT validation flow', async () => {
      const { jwtVerify } = await import('jose');
      
      vi.mocked(jwtVerify).mockResolvedValue({
        payload: {
          sub: 'user-123',
          aud: 'client-123',
          exp: Math.floor(Date.now() / 1000) + 3600,
          iat: Math.floor(Date.now() / 1000),
        },
        protectedHeader: {},
      } as any);

      const result = await validateOIDCJWT('test-token');

      expect(result).toHaveProperty('userId', 'user-123');
      expect(result).toHaveProperty('clientId', 'client-123');
      expect(result).toHaveProperty('payload');
      expect(result).toHaveProperty('tokenData');
    });

    it('should throw error when JWT lacks user ID', async () => {
      const { jwtVerify } = await import('jose');
      
      vi.mocked(jwtVerify).mockResolvedValue({
        payload: { aud: 'client-123' }, // Missing sub
        protectedHeader: {},
      } as any);

      await expect(validateOIDCJWT('invalid-token')).rejects.toThrow();
    });

    it('should handle JWT verification failures', async () => {
      const { jwtVerify } = await import('jose');
      
      vi.mocked(jwtVerify).mockRejectedValue(new Error('Invalid signature'));

      await expect(validateOIDCJWT('invalid-token')).rejects.toThrow();
    });

    it('should extract token data correctly', async () => {
      const { jwtVerify } = await import('jose');
      
      const mockPayload = {
        sub: 'user-456',
        aud: 'client-456',
        exp: 1234567890,
        iat: 1234567800,
        jti: 'token-456',
        scope: 'openid email profile',
      };

      vi.mocked(jwtVerify).mockResolvedValue({
        payload: mockPayload,
        protectedHeader: {},
      } as any);

      const result = await validateOIDCJWT('test-token');

      expect(result.tokenData).toEqual({
        sub: 'user-456',
        aud: 'client-456',
        client_id: 'client-456',
        exp: 1234567890,
        iat: 1234567800,
        jti: 'token-456',
        scope: 'openid email profile',
      });
    });
  });

  describe('Module Structure', () => {
    it('should export required functions', () => {
      expect(typeof getJWKS).toBe('function');
      expect(typeof validateOIDCJWT).toBe('function');
    });

    it('should handle module imports correctly', async () => {
      // Test that the module can be imported without errors
      const module = await import('../jwt');
      
      expect(module).toHaveProperty('getJWKS');
      expect(module).toHaveProperty('validateOIDCJWT');
    });
  });
});