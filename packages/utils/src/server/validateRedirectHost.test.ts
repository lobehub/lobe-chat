import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { validateRedirectHost } from './validateRedirectHost';

describe('validateRedirectHost', () => {
  let originalAppUrl: string | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    // Store original APP_URL and set default for tests
    originalAppUrl = process.env.APP_URL;
    process.env.APP_URL = 'https://example.com';
  });

  afterEach(() => {
    // Restore original APP_URL
    if (originalAppUrl === undefined) {
      delete process.env.APP_URL;
    } else {
      process.env.APP_URL = originalAppUrl;
    }
  });

  describe('invalid inputs', () => {
    it('should return false when targetHost is empty string', () => {
      const result = validateRedirectHost('');
      expect(result).toBe(false);
    });

    it('should return false when targetHost is "null" string', () => {
      const result = validateRedirectHost('null');
      expect(result).toBe(false);
    });

    it('should return false when APP_URL is not configured', () => {
      delete process.env.APP_URL;
      const result = validateRedirectHost('example.com');
      expect(result).toBe(false);
    });

    it('should return false when APP_URL is malformed', () => {
      process.env.APP_URL = 'not-a-valid-url';
      const result = validateRedirectHost('example.com');
      expect(result).toBe(false);
    });
  });

  describe('exact host match', () => {
    it('should return true when targetHost exactly matches APP_URL host', () => {
      const result = validateRedirectHost('example.com');
      expect(result).toBe(true);
    });

    it('should return true when targetHost matches APP_URL host with port', () => {
      process.env.APP_URL = 'https://example.com:8080';
      const result = validateRedirectHost('example.com:8080');
      expect(result).toBe(true);
    });

    it('should return true when targetHost matches APP_URL with different protocols', () => {
      process.env.APP_URL = 'http://example.com';
      const result = validateRedirectHost('example.com');
      expect(result).toBe(true);
    });

    it('should return false when targetHost port differs from APP_URL', () => {
      process.env.APP_URL = 'https://example.com:8080';
      const result = validateRedirectHost('example.com:9090');
      expect(result).toBe(false);
    });
  });

  describe('localhost validation', () => {
    it('should allow localhost when APP_URL is localhost', () => {
      process.env.APP_URL = 'http://localhost:3000';
      const result = validateRedirectHost('localhost');
      expect(result).toBe(true);
    });

    it('should allow localhost with port when APP_URL is localhost', () => {
      process.env.APP_URL = 'http://localhost:3000';
      const result = validateRedirectHost('localhost:8080');
      expect(result).toBe(true);
    });

    it('should allow 127.0.0.1 when APP_URL is localhost', () => {
      process.env.APP_URL = 'http://localhost:3000';
      const result = validateRedirectHost('127.0.0.1');
      expect(result).toBe(true);
    });

    it('should allow 127.0.0.1 with port when APP_URL is localhost', () => {
      process.env.APP_URL = 'http://localhost:3000';
      const result = validateRedirectHost('127.0.0.1:8080');
      expect(result).toBe(true);
    });

    it('should allow 0.0.0.0 when APP_URL is localhost', () => {
      process.env.APP_URL = 'http://localhost:3000';
      const result = validateRedirectHost('0.0.0.0');
      expect(result).toBe(true);
    });

    it('should allow 0.0.0.0 with port when APP_URL is localhost', () => {
      process.env.APP_URL = 'http://localhost:3000';
      const result = validateRedirectHost('0.0.0.0:8080');
      expect(result).toBe(true);
    });

    it('should allow localhost when APP_URL is 127.0.0.1', () => {
      process.env.APP_URL = 'http://127.0.0.1:3000';
      const result = validateRedirectHost('localhost');
      expect(result).toBe(true);
    });

    it('should allow localhost when APP_URL is 0.0.0.0', () => {
      process.env.APP_URL = 'http://0.0.0.0:3000';
      const result = validateRedirectHost('localhost');
      expect(result).toBe(true);
    });

    it('should reject localhost when APP_URL is not a local address', () => {
      process.env.APP_URL = 'https://example.com';
      const result = validateRedirectHost('localhost');
      expect(result).toBe(false);
    });

    it('should reject 127.0.0.1 when APP_URL is not a local address', () => {
      process.env.APP_URL = 'https://example.com';
      const result = validateRedirectHost('127.0.0.1');
      expect(result).toBe(false);
    });

    it('should reject 0.0.0.0 when APP_URL is not a local address', () => {
      process.env.APP_URL = 'https://example.com';
      const result = validateRedirectHost('0.0.0.0');
      expect(result).toBe(false);
    });
  });

  describe('subdomain validation', () => {
    it('should allow valid subdomain of APP_URL domain', () => {
      process.env.APP_URL = 'https://example.com';
      const result = validateRedirectHost('api.example.com');
      expect(result).toBe(true);
    });

    it('should allow multi-level subdomain', () => {
      process.env.APP_URL = 'https://example.com';
      const result = validateRedirectHost('api.v1.example.com');
      expect(result).toBe(true);
    });

    it('should allow subdomain with port', () => {
      process.env.APP_URL = 'https://example.com';
      const result = validateRedirectHost('api.example.com:8080');
      expect(result).toBe(true);
    });

    it('should reject domain that is not a subdomain', () => {
      process.env.APP_URL = 'https://example.com';
      const result = validateRedirectHost('fakeexample.com');
      expect(result).toBe(false);
    });

    it('should reject domain that contains but is not subdomain', () => {
      process.env.APP_URL = 'https://example.com';
      const result = validateRedirectHost('notexample.com');
      expect(result).toBe(false);
    });

    it('should reject completely different domain', () => {
      process.env.APP_URL = 'https://example.com';
      const result = validateRedirectHost('evil.com');
      expect(result).toBe(false);
    });

    it('should handle APP_URL with port when validating subdomains', () => {
      process.env.APP_URL = 'https://example.com:8080';
      const result = validateRedirectHost('api.example.com');
      expect(result).toBe(true);
    });

    it('should handle APP_URL with subdomain when validating further subdomains', () => {
      process.env.APP_URL = 'https://api.example.com';
      const result = validateRedirectHost('v1.api.example.com');
      expect(result).toBe(true);
    });
  });

  describe('open redirect attack prevention', () => {
    it('should block redirection to malicious external domain', () => {
      process.env.APP_URL = 'https://example.com';
      const result = validateRedirectHost('malicious.com');
      expect(result).toBe(false);
    });

    it('should block redirection to similar-looking domain', () => {
      process.env.APP_URL = 'https://example.com';
      const result = validateRedirectHost('example.com.evil.com');
      expect(result).toBe(false);
    });

    it('should block redirection to domain with extra TLD', () => {
      process.env.APP_URL = 'https://example.com';
      const result = validateRedirectHost('example.com.br');
      expect(result).toBe(false);
    });

    it('should block redirection using homograph attack attempt', () => {
      process.env.APP_URL = 'https://example.com';
      // Using similar-looking characters
      const result = validateRedirectHost('examp1e.com');
      expect(result).toBe(false);
    });
  });

  describe('port handling', () => {
    it('should handle standard HTTPS port (443) - normalized by URL API', () => {
      // Note: URL API normalizes standard ports, so :443 is removed from https URLs
      process.env.APP_URL = 'https://example.com:443';
      // APP_URL becomes https://example.com (443 is default for https)
      const result = validateRedirectHost('example.com');
      expect(result).toBe(true);
    });

    it('should handle standard HTTP port (80) - normalized by URL API', () => {
      // Note: URL API normalizes standard ports, so :80 is removed from http URLs
      process.env.APP_URL = 'http://example.com:80';
      // APP_URL becomes http://example.com (80 is default for http)
      const result = validateRedirectHost('example.com');
      expect(result).toBe(true);
    });

    it('should handle custom ports', () => {
      process.env.APP_URL = 'https://example.com:3000';
      const result = validateRedirectHost('example.com:3000');
      expect(result).toBe(true);
    });

    it('should reject different ports on same domain', () => {
      process.env.APP_URL = 'https://example.com:3000';
      const result = validateRedirectHost('example.com:4000');
      expect(result).toBe(false);
    });

    it('should allow subdomain with different port than APP_URL', () => {
      process.env.APP_URL = 'https://example.com:3000';
      const result = validateRedirectHost('api.example.com:8080');
      expect(result).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle APP_URL with trailing slash', () => {
      process.env.APP_URL = 'https://example.com/';
      const result = validateRedirectHost('example.com');
      expect(result).toBe(true);
    });

    it('should handle APP_URL with path', () => {
      process.env.APP_URL = 'https://example.com/app';
      const result = validateRedirectHost('example.com');
      expect(result).toBe(true);
    });

    it('should handle uppercase in targetHost', () => {
      process.env.APP_URL = 'https://example.com';
      const result = validateRedirectHost('EXAMPLE.COM');
      expect(result).toBe(false);
    });

    it('should handle mixed case domains - URL API lowercases hostnames', () => {
      // Note: URL API automatically lowercases hostnames
      process.env.APP_URL = 'https://Example.Com';
      // URL API converts it to example.com
      const result = validateRedirectHost('example.com');
      expect(result).toBe(true);
    });

    it('should handle IPv4 addresses in APP_URL', () => {
      process.env.APP_URL = 'http://192.168.1.1:3000';
      const result = validateRedirectHost('192.168.1.1:3000');
      expect(result).toBe(true);
    });

    it('should reject different IPv4 addresses', () => {
      process.env.APP_URL = 'http://192.168.1.1:3000';
      const result = validateRedirectHost('192.168.1.2:3000');
      expect(result).toBe(false);
    });

    it('should handle empty APP_URL gracefully', () => {
      process.env.APP_URL = '';
      const result = validateRedirectHost('example.com');
      expect(result).toBe(false);
    });

    it('should handle whitespace in targetHost', () => {
      const result = validateRedirectHost('  example.com  ');
      expect(result).toBe(false);
    });

    it('should handle single dot in targetHost', () => {
      const result = validateRedirectHost('.');
      expect(result).toBe(false);
    });

    it('should handle double dots in targetHost', () => {
      const result = validateRedirectHost('example..com');
      expect(result).toBe(false);
    });
  });

  describe('real-world scenarios', () => {
    it('should validate production domain correctly', () => {
      process.env.APP_URL = 'https://chat.lobehub.com';
      const result = validateRedirectHost('chat.lobehub.com');
      expect(result).toBe(true);
    });

    it('should allow API subdomain in production', () => {
      process.env.APP_URL = 'https://chat.lobehub.com';
      const result = validateRedirectHost('api.chat.lobehub.com');
      expect(result).toBe(true);
    });

    it('should block redirect to competitor domain', () => {
      process.env.APP_URL = 'https://chat.lobehub.com';
      const result = validateRedirectHost('competitor.com');
      expect(result).toBe(false);
    });

    it('should support development environment with port', () => {
      process.env.APP_URL = 'http://localhost:3010';
      const result = validateRedirectHost('localhost:3010');
      expect(result).toBe(true);
    });

    it('should support staging environment', () => {
      process.env.APP_URL = 'https://staging.example.com';
      const result = validateRedirectHost('staging.example.com');
      expect(result).toBe(true);
    });

    it('should allow preview deployment subdomain', () => {
      process.env.APP_URL = 'https://example.com';
      const result = validateRedirectHost('pr-123.example.com');
      expect(result).toBe(true);
    });
  });
});
