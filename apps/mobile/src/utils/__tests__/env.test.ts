import { isDev } from '../env';

describe('env utilities', () => {
  describe('isDev', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      // Restore original environment after each test
      process.env.NODE_ENV = originalEnv;
    });

    it('should return true when NODE_ENV is development', () => {
      process.env.NODE_ENV = 'development';
      // Need to re-import to get updated value
      jest.resetModules();
      const { isDev } = require('../env');
      expect(isDev).toBe(true);
    });

    it('should return false when NODE_ENV is production', () => {
      process.env.NODE_ENV = 'production';
      jest.resetModules();
      const { isDev } = require('../env');
      expect(isDev).toBe(false);
    });

    it('should return false when NODE_ENV is test', () => {
      process.env.NODE_ENV = 'test';
      jest.resetModules();
      const { isDev } = require('../env');
      expect(isDev).toBe(false);
    });

    it('should return false when NODE_ENV is undefined', () => {
      delete process.env.NODE_ENV;
      jest.resetModules();
      const { isDev } = require('../env');
      expect(isDev).toBe(false);
    });

    it('should return false for other NODE_ENV values', () => {
      process.env.NODE_ENV = 'staging';
      jest.resetModules();
      const { isDev } = require('../env');
      expect(isDev).toBe(false);
    });
  });
});
