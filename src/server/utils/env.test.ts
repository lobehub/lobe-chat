import { describe, expect, it, vi } from 'vitest';

import { getEnvironment, isDev, isOnServerSide } from './env';

describe('env utils', () => {
  describe('getEnvironment', () => {
    it('should return empty string if process is undefined', () => {
      const originalProcess = global.process;
      // @ts-ignore
      global.process = undefined;

      expect(getEnvironment('TEST_KEY')).toBe('');

      global.process = originalProcess;
    });

    it('should return empty string if env var not found', () => {
      expect(getEnvironment('NON_EXISTENT_KEY')).toBe('');
    });

    it('should return env var value if exists', () => {
      const originalEnv = process.env.TEST_KEY;
      process.env.TEST_KEY = 'test-value';
      expect(getEnvironment('TEST_KEY')).toBe('test-value');
      process.env.TEST_KEY = originalEnv;
    });
  });

  describe('isDev', () => {
    const originalNodeEnv = process.env.NODE_ENV;

    beforeEach(() => {
      vi.resetModules();
    });

    afterEach(() => {
      // @ts-ignore
      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should be true in development environment', async () => {
      // @ts-ignore
      process.env.NODE_ENV = 'development';
      const { isDev } = await import('./env');
      expect(isDev).toBe(true);
    });

    it('should be false in production environment', async () => {
      // @ts-ignore
      process.env.NODE_ENV = 'production';
      const { isDev } = await import('./env');
      expect(isDev).toBe(false);
    });
  });

  describe('isOnServerSide', () => {
    const originalWindow = global.window;

    beforeEach(() => {
      vi.resetModules();
    });

    afterEach(() => {
      // @ts-ignore
      global.window = originalWindow;
    });

    it('should be true when window is undefined', async () => {
      // @ts-ignore
      delete global.window;
      const { isOnServerSide } = await import('./env');
      expect(isOnServerSide).toBe(true);
    });

    it('should be false when window is defined', async () => {
      // @ts-ignore
      global.window = {};
      const { isOnServerSide } = await import('./env');
      expect(isOnServerSide).toBe(false);
    });
  });
});
