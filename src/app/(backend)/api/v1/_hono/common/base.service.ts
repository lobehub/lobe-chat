import { LobeChatDatabase } from '@/database/type';

import { IBaseService } from '../types';

/**
 * Base service class
 * Provides unified service layer base functionality, consistent with the project's existing service layer pattern
 */
export abstract class BaseService implements IBaseService {
  protected userId?: string;
  public db: LobeChatDatabase;

  constructor(db: LobeChatDatabase, userId?: string) {
    this.db = db;
    this.userId = userId;
  }

  /**
   * Business error class
   */
  protected createBusinessError(message: string): Error {
    const error = new Error(message);
    error.name = 'BusinessError';
    return error;
  }

  /**
   * Authentication error class
   */
  protected createAuthError(message: string): Error {
    const error = new Error(message);
    error.name = 'AuthenticationError';
    return error;
  }

  /**
   * Authorization error class
   */
  protected createAuthorizationError(message: string): Error {
    const error = new Error(message);
    error.name = 'AuthorizationError';
    return error;
  }

  /**
   * Common error class for other scenarios
   */
  protected createCommonError(message: string): Error {
    const error = new Error(message);
    error.name = 'NotFoundError';
    return error;
  }

  /**
   * Logging utility
   * @param level Log level
   * @param message Log message
   * @param data Additional data
   */
  protected log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    const logMessage = `[${this.constructor.name}] ${message}`;

    switch (level) {
      case 'info': {
        console.info(logMessage, data);
        break;
      }
      case 'warn': {
        console.warn(logMessage, data);
        break;
      }
      case 'error': {
        console.error(logMessage, data);
        break;
      }
    }
  }
}
