import { LobeChatDatabase } from '@/database/type';

import { IBaseService } from '../types';

/**
 * Base service class
 * Provides unified service layer base functionality, consistent with the project's existing service layer pattern
 */
export abstract class BaseService implements IBaseService {
  protected userId: string;
  public db: LobeChatDatabase;

  constructor(db: LobeChatDatabase, userId: string | null) {
    this.db = db;
    this.userId = userId || '';
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
   * Not found error class
   */
  protected createNotFoundError(message: string): Error {
    const error = new Error(message);
    error.name = 'NotFoundError';
    return error;
  }

  /**
   * Validation error class
   */
  protected createValidationError(message: string): Error {
    const error = new Error(message);
    error.name = 'ValidationError';
    return error;
  }

  /**
   * Common error class (alias for business error)
   */
  protected createCommonError(message: string): Error {
    return this.createBusinessError(message);
  }

  /**
   * 统一错误处理方法
   * @param error 捕获的错误
   * @param operation 操作名称
   * @param fallbackMessage 默认错误消息
   */
  protected handleServiceError(error: unknown, operation: string, fallbackMessage?: string): never {
    this.log('error', `${operation}失败`, { error });

    // 如果是已知的业务错误，直接抛出
    if (
      error instanceof Error &&
      [
        'BusinessError',
        'AuthenticationError',
        'AuthorizationError',
        'NotFoundError',
        'ValidationError',
      ].includes(error.name)
    ) {
      throw error;
    }

    // 其他错误统一包装为业务错误
    throw this.createBusinessError(fallbackMessage || `${operation}失败`);
  }

  /**
   * Logging utility
   * @param level Log level
   * @param message Log message
   * @param data Additional data
   */
  protected log(level: 'info' | 'warn' | 'error' | 'debug', message: string, data?: any): void {
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
      case 'debug': {
        console.debug(logMessage, data);
        break;
      }
    }
  }
}
