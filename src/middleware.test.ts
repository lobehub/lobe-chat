import { describe, expect, it } from 'vitest';

// Mock createRouteMatcher from @clerk/nextjs/server
const mockCreateRouteMatcher = (patterns: string[]) => {
  return (req: { url: string }) => {
    const path = new URL(req.url).pathname;
    return patterns.some((pattern) => {
      if (pattern.endsWith('(.*)')) {
        const base = pattern.slice(0, -4);
        return path.startsWith(base);
      }
      return path === pattern;
    });
  };
};

// Create a mock version of isProtectedRoute using the same patterns
const isProtectedRoute = mockCreateRouteMatcher(['/settings(.*)', '/files(.*)', '/onboard(.*)']);

describe('isProtectedRoute', () => {
  it('should return true for protected routes', () => {
    const protectedPaths = [
      '/settings',
      '/settings/profile',
      '/files',
      '/files/123',
      '/onboard',
      '/onboard/welcome',
    ];

    protectedPaths.forEach((path) => {
      const mockRequest = {
        url: `http://localhost${path}`,
      };
      expect(isProtectedRoute(mockRequest)).toBe(true);
    });
  });

  it('should return false for non-protected routes', () => {
    const nonProtectedPaths = [
      '/',
      '/chat',
      '/discover',
      '/login',
      '/signup',
      '/api/chat',
      '/trpc/hello',
      '/webapi/test',
    ];

    nonProtectedPaths.forEach((path) => {
      const mockRequest = {
        url: `http://localhost${path}`,
      };
      expect(isProtectedRoute(mockRequest)).toBe(false);
    });
  });
});
