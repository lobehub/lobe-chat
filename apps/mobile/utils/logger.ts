import { logger, consoleTransport } from 'react-native-logs';

// Create the main logger instance
const log = logger.createLogger({
  async: true,
  dateFormat: 'time',
  enabled: true,
  printDate: true,
  printLevel: true,
  severity: (global as any).__DEV__ ? 'debug' : 'error',
  transport: consoleTransport,
  transportOptions: {
    colors: {
      error: 'redBright',
      info: 'blueBright',
      warn: 'yellowBright',
    },
  },
});

/**
 * Create a namespaced logger for specific modules
 * @param namespace - The namespace for the logger (e.g., 'auth', 'chat', 'api')
 * @returns Logger instance with namespace prefix
 */
export const createLogger = (namespace: string) => {
  return {
    debug: (message: string, ...args: any[]) => {
      log.debug(`[${namespace}] ${message}`, ...args);
    },
    error: (message: string, ...args: any[]) => {
      log.error(`[${namespace}] ${message}`, ...args);
    },
    info: (message: string, ...args: any[]) => {
      log.info(`[${namespace}] ${message}`, ...args);
    },
    warn: (message: string, ...args: any[]) => {
      log.warn(`[${namespace}] ${message}`, ...args);
    },
  };
};

// Export the main logger for direct use
export { log };

// Pre-configured loggers for common modules
export const apiLogger = createLogger('api');
export const authLogger = createLogger('auth');
export const chatLogger = createLogger('chat');
export const uiLogger = createLogger('ui');
