import debug from 'debug';
import electronLog from 'electron-log';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createLogger } from '../logger';

vi.mock('debug');
vi.mock('electron-log', () => ({
  default: {
    transports: {
      file: { level: 'info' },
      console: { level: 'warn' },
    },
    error: vi.fn(),
    info: vi.fn(),
    verbose: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('logger', () => {
  const mockDebugLogger = vi.fn();

  beforeEach(() => {
    vi.mocked(debug).mockReturnValue(mockDebugLogger as any);
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete (process.env as NodeJS.ProcessEnv & { NODE_ENV?: string }).NODE_ENV;
    delete process.env.DEBUG_VERBOSE;
  });

  describe('createLogger', () => {
    it('should create logger with correct namespace', () => {
      const namespace = 'test:logger';
      createLogger(namespace);

      expect(debug).toHaveBeenCalledWith(namespace);
    });

    it('should return logger object with all methods', () => {
      const logger = createLogger('test:logger');

      expect(logger).toHaveProperty('debug');
      expect(logger).toHaveProperty('error');
      expect(logger).toHaveProperty('info');
      expect(logger).toHaveProperty('verbose');
      expect(logger).toHaveProperty('warn');
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.verbose).toBe('function');
      expect(typeof logger.warn).toBe('function');
    });
  });

  describe('logger.debug', () => {
    it('should call debug logger with message and args', () => {
      const logger = createLogger('test:debug');
      logger.debug('test message', { data: 'value' });

      expect(mockDebugLogger).toHaveBeenCalledWith('test message', { data: 'value' });
    });

    it('should handle multiple arguments', () => {
      const logger = createLogger('test:debug');
      logger.debug('message', 'arg1', 'arg2', 'arg3');

      expect(mockDebugLogger).toHaveBeenCalledWith('message', 'arg1', 'arg2', 'arg3');
    });
  });

  describe('logger.error', () => {
    it('should use electronLog.error in production', () => {
      (process.env as NodeJS.ProcessEnv & { NODE_ENV?: string }).NODE_ENV = 'production';
      const logger = createLogger('test:error');
      logger.error('error message', { error: 'details' });

      expect(electronLog.error).toHaveBeenCalledWith('error message', { error: 'details' });
      expect(mockDebugLogger).not.toHaveBeenCalled();
    });

    it('should use console.error in development', () => {
      (process.env as NodeJS.ProcessEnv & { NODE_ENV?: string }).NODE_ENV = 'development';
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const logger = createLogger('test:error');
      logger.error('error message', { error: 'details' });

      expect(consoleErrorSpy).toHaveBeenCalledWith('error message', { error: 'details' });
      expect(electronLog.error).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should default to console.error when NODE_ENV is not set', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const logger = createLogger('test:error');
      logger.error('error message');

      expect(consoleErrorSpy).toHaveBeenCalledWith('error message');
      expect(electronLog.error).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('logger.info', () => {
    it('should use electronLog.info with namespace in production', () => {
      (process.env as NodeJS.ProcessEnv & { NODE_ENV?: string }).NODE_ENV = 'production';
      const logger = createLogger('test:info');
      logger.info('info message', { data: 'value' });

      expect(electronLog.info).toHaveBeenCalledWith('[test:info]', 'info message', {
        data: 'value',
      });
      expect(mockDebugLogger).toHaveBeenCalledWith('INFO: info message', { data: 'value' });
    });

    it('should use debug logger in development', () => {
      (process.env as NodeJS.ProcessEnv & { NODE_ENV?: string }).NODE_ENV = 'development';
      const logger = createLogger('test:info');
      logger.info('info message', { data: 'value' });

      expect(electronLog.info).not.toHaveBeenCalled();
      expect(mockDebugLogger).toHaveBeenCalledWith('INFO: info message', { data: 'value' });
    });

    it('should always call debug logger regardless of environment', () => {
      const logger = createLogger('test:info');
      logger.info('info message');

      expect(mockDebugLogger).toHaveBeenCalledWith('INFO: info message');
    });
  });

  describe('logger.verbose', () => {
    it('should always call electronLog.verbose', () => {
      const logger = createLogger('test:verbose');
      logger.verbose('verbose message', { data: 'value' });

      expect(electronLog.verbose).toHaveBeenCalledWith('verbose message', { data: 'value' });
    });

    it('should call debug logger when DEBUG_VERBOSE is set', () => {
      process.env.DEBUG_VERBOSE = 'true';
      const logger = createLogger('test:verbose');
      logger.verbose('verbose message', { data: 'value' });

      expect(electronLog.verbose).toHaveBeenCalledWith('verbose message', { data: 'value' });
      expect(mockDebugLogger).toHaveBeenCalledWith('VERBOSE: verbose message', { data: 'value' });
    });

    it('should not call debug logger when DEBUG_VERBOSE is not set', () => {
      const logger = createLogger('test:verbose');
      logger.verbose('verbose message', { data: 'value' });

      expect(electronLog.verbose).toHaveBeenCalledWith('verbose message', { data: 'value' });
      expect(mockDebugLogger).not.toHaveBeenCalled();
    });
  });

  describe('logger.warn', () => {
    it('should use electronLog.warn in production', () => {
      (process.env as NodeJS.ProcessEnv & { NODE_ENV?: string }).NODE_ENV = 'production';
      const logger = createLogger('test:warn');
      logger.warn('warn message', { warning: 'details' });

      expect(electronLog.warn).toHaveBeenCalledWith('warn message', { warning: 'details' });
      expect(mockDebugLogger).toHaveBeenCalledWith('WARN: warn message', { warning: 'details' });
    });

    it('should not use electronLog.warn in development', () => {
      (process.env as NodeJS.ProcessEnv & { NODE_ENV?: string }).NODE_ENV = 'development';
      const logger = createLogger('test:warn');
      logger.warn('warn message');

      expect(electronLog.warn).not.toHaveBeenCalled();
      expect(mockDebugLogger).toHaveBeenCalledWith('WARN: warn message');
    });

    it('should always call debug logger regardless of environment', () => {
      const logger = createLogger('test:warn');
      logger.warn('warn message');

      expect(mockDebugLogger).toHaveBeenCalledWith('WARN: warn message');
    });
  });

  describe('logger integration', () => {
    it('should handle empty messages', () => {
      const logger = createLogger('test:integration');
      logger.debug('');
      logger.info('');
      logger.warn('');

      expect(mockDebugLogger).toHaveBeenCalledWith('');
      expect(mockDebugLogger).toHaveBeenCalledWith('INFO: ');
      expect(mockDebugLogger).toHaveBeenCalledWith('WARN: ');
    });

    it('should handle no additional arguments', () => {
      const logger = createLogger('test:integration');
      logger.debug('message');
      logger.error('message');
      logger.info('message');
      logger.verbose('message');
      logger.warn('message');

      expect(mockDebugLogger).toHaveBeenCalledWith('message');
    });

    it('should format messages consistently across different log levels', () => {
      const logger = createLogger('app:test');
      const message = 'test message';
      const args = { key: 'value' };

      logger.debug(message, args);
      logger.info(message, args);
      logger.warn(message, args);
      logger.verbose(message, args);

      expect(mockDebugLogger).toHaveBeenCalledWith(message, args);
      expect(mockDebugLogger).toHaveBeenCalledWith(`INFO: ${message}`, args);
      expect(mockDebugLogger).toHaveBeenCalledWith(`WARN: ${message}`, args);
      expect(electronLog.verbose).toHaveBeenCalledWith(message, args);
    });
  });
});
