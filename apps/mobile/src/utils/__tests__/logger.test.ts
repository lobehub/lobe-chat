/**
 * @jest-environment node
 */

// Mock react-native-logs to avoid dependency issues in test environment
const mockLog = {
  debug: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
};

const mockCreateLogger = jest.fn().mockReturnValue(mockLog);

jest.mock('react-native-logs', () => ({
  logger: {
    createLogger: mockCreateLogger,
  },
  consoleTransport: {},
}));

// Mock global.__DEV__ for testing
Object.defineProperty(global, '__DEV__', {
  writable: true,
  value: true,
});

describe('logger utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createLogger', () => {
    it('should create a logger with namespace prefix', () => {
      const { createLogger } = require('../logger');
      const logger = createLogger('test');

      // Test all logging methods
      logger.debug('debug message', { data: 'test' });
      logger.error('error message', new Error('test'));
      logger.info('info message');
      logger.warn('warn message', 'extra');

      expect(mockLog.debug).toHaveBeenCalledWith('[test] debug message', { data: 'test' });
      expect(mockLog.error).toHaveBeenCalledWith('[test] error message', new Error('test'));
      expect(mockLog.info).toHaveBeenCalledWith('[test] info message');
      expect(mockLog.warn).toHaveBeenCalledWith('[test] warn message', 'extra');
    });

    it('should handle multiple arguments correctly', () => {
      const { createLogger } = require('../logger');
      const logger = createLogger('multi');

      logger.debug('message', 'arg1', 'arg2', { key: 'value' });

      expect(mockLog.debug).toHaveBeenCalledWith('[multi] message', 'arg1', 'arg2', {
        key: 'value',
      });
    });

    it('should handle empty namespace', () => {
      const { createLogger } = require('../logger');
      const logger = createLogger('');

      logger.info('test message');

      expect(mockLog.info).toHaveBeenCalledWith('[] test message');
    });
  });

  describe('pre-configured loggers', () => {
    it('should export pre-configured logger instances', () => {
      const { apiLogger, authLogger, chatLogger, uiLogger } = require('../logger');

      expect(apiLogger).toBeDefined();
      expect(typeof apiLogger.debug).toBe('function');
      expect(typeof apiLogger.error).toBe('function');
      expect(typeof apiLogger.info).toBe('function');
      expect(typeof apiLogger.warn).toBe('function');

      expect(authLogger).toBeDefined();
      expect(typeof authLogger.debug).toBe('function');
      expect(typeof authLogger.error).toBe('function');
      expect(typeof authLogger.info).toBe('function');
      expect(typeof authLogger.warn).toBe('function');

      expect(chatLogger).toBeDefined();
      expect(typeof chatLogger.debug).toBe('function');
      expect(typeof chatLogger.error).toBe('function');
      expect(typeof chatLogger.info).toBe('function');
      expect(typeof chatLogger.warn).toBe('function');

      expect(uiLogger).toBeDefined();
      expect(typeof uiLogger.debug).toBe('function');
      expect(typeof uiLogger.error).toBe('function');
      expect(typeof uiLogger.info).toBe('function');
      expect(typeof uiLogger.warn).toBe('function');
    });

    it('should use correct namespaces for pre-configured loggers', () => {
      const { apiLogger, authLogger, chatLogger, uiLogger } = require('../logger');

      apiLogger.info('test');
      authLogger.error('test error');
      chatLogger.debug('test debug');
      uiLogger.warn('test warning');

      expect(mockLog.info).toHaveBeenCalledWith('[api] test');
      expect(mockLog.error).toHaveBeenCalledWith('[auth] test error');
      expect(mockLog.debug).toHaveBeenCalledWith('[chat] test debug');
      expect(mockLog.warn).toHaveBeenCalledWith('[ui] test warning');
    });
  });

  describe('main log instance', () => {
    it('should export the main log instance', () => {
      const { log } = require('../logger');
      expect(log).toBeDefined();
      expect(log).toBe(mockLog);
    });
  });

  describe('logger configuration', () => {
    it('should configure logger with correct options in development', () => {
      // Clear the module cache and re-require to test configuration
      jest.resetModules();
      Object.defineProperty(global, '__DEV__', { value: true });

      require('../logger');

      expect(mockCreateLogger).toHaveBeenCalledWith({
        async: true,
        dateFormat: 'time',
        enabled: true,
        printDate: true,
        printLevel: true,
        severity: 'debug',
        transport: {},
        transportOptions: {
          colors: {
            error: 'redBright',
            info: 'blueBright',
            warn: 'yellowBright',
          },
        },
      });
    });

    it('should use error severity in production', () => {
      // Mock production environment
      Object.defineProperty(global, '__DEV__', { value: false });
      jest.resetModules();

      require('../logger');

      expect(mockCreateLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'error',
        }),
      );
    });
  });
});
