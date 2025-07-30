// This file is deprecated. Use utils/logger.ts instead.
// Keeping for backwards compatibility during migration.

/**
 * @deprecated Use createLogger from utils/logger.ts instead
 */
export { createLogger } from './logger';

/**
 * @deprecated These utilities are no longer needed with react-native-logs
 */
export const safeDebugObject = (obj: any): any => obj;
export const formatDebugMessage = (message: string, data?: any): [string, any?] => [message, data];

/**
 * @deprecated Use the logger interface from utils/logger.ts instead
 */
export interface Logger {
  debug: (message: string, data?: any) => void;
  error: (message: string, data?: any) => void;
  info: (message: string, data?: any) => void;
  warn: (message: string, data?: any) => void;
}
