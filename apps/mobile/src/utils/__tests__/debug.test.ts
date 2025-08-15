import { createLogger, safeDebugObject, formatDebugMessage, Logger } from '../debug';

// Mock the logger module to test the deprecation wrapper
jest.mock('../logger', () => ({
  createLogger: jest.fn().mockReturnValue({
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  }),
}));

describe('debug utilities (deprecated)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createLogger (deprecated wrapper)', () => {
    it('should call the new createLogger from logger module', () => {
      const mockCreateLogger = require('../logger').createLogger;
      const namespace = 'test';

      createLogger(namespace);

      expect(mockCreateLogger).toHaveBeenCalledWith(namespace);
    });

    it('should return a logger with correct interface', () => {
      const logger = createLogger('test');

      expect(logger).toBeDefined();
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
    });
  });

  describe('safeDebugObject (deprecated)', () => {
    it('should return the same object passed to it', () => {
      const testObj = { key: 'value', number: 42 };
      const result = safeDebugObject(testObj);

      expect(result).toBe(testObj);
      expect(result).toEqual({ key: 'value', number: 42 });
    });

    it('should handle null and undefined', () => {
      expect(safeDebugObject(null)).toBe(null);
      expect(safeDebugObject(undefined)).toBe(undefined);
    });

    it('should handle primitive values', () => {
      expect(safeDebugObject('string')).toBe('string');
      expect(safeDebugObject(123)).toBe(123);
      expect(safeDebugObject(true)).toBe(true);
    });

    it('should handle arrays', () => {
      const testArray = [1, 2, 3];
      const result = safeDebugObject(testArray);

      expect(result).toBe(testArray);
      expect(result).toEqual([1, 2, 3]);
    });
  });

  describe('formatDebugMessage (deprecated)', () => {
    it('should return message and data as array', () => {
      const message = 'Test message';
      const data = { key: 'value' };

      const result = formatDebugMessage(message, data);

      expect(result).toEqual([message, data]);
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toBe(message);
      expect(result[1]).toBe(data);
    });

    it('should handle message without data', () => {
      const message = 'Test message';

      const result = formatDebugMessage(message);

      expect(result).toEqual([message, undefined]);
      expect(result.length).toBe(2);
    });

    it('should handle empty message', () => {
      const result = formatDebugMessage('');

      expect(result).toEqual(['', undefined]);
    });

    it('should handle various data types', () => {
      expect(formatDebugMessage('msg', null)).toEqual(['msg', null]);
      expect(formatDebugMessage('msg', 123)).toEqual(['msg', 123]);
      expect(formatDebugMessage('msg', 'data')).toEqual(['msg', 'data']);
      expect(formatDebugMessage('msg', [1, 2, 3])).toEqual(['msg', [1, 2, 3]]);
    });
  });

  describe('Logger interface', () => {
    it('should have correct method signatures', () => {
      // This is a type-only test to ensure the interface is correctly defined
      const logger: Logger = {
        debug: (message: string, data?: any) => {},
        error: (message: string, data?: any) => {},
        info: (message: string, data?: any) => {},
        warn: (message: string, data?: any) => {},
      };

      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
    });

    it('should allow optional data parameter', () => {
      const logger: Logger = {
        debug: jest.fn(),
        error: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
      };

      // These should not throw TypeScript errors
      logger.debug('message');
      logger.debug('message', { data: 'value' });
      logger.error('error');
      logger.error('error', new Error('test'));
      logger.info('info');
      logger.info('info', 'string data');
      logger.warn('warning');
      logger.warn('warning', 123);

      expect(logger.debug).toHaveBeenCalledTimes(2);
      expect(logger.error).toHaveBeenCalledTimes(2);
      expect(logger.info).toHaveBeenCalledTimes(2);
      expect(logger.warn).toHaveBeenCalledTimes(2);
    });
  });
});
