import { PERMISSION_ACTIONS } from '@/const/rbac';
import { RbacModel } from '@/database/models/rbac';
import { LobeChatDatabase } from '@/database/type';

import { IBaseService } from '../types';

/**
 * Base service class
 * Provides unified service layer base functionality, consistent with the project's existing service layer pattern
 */
export abstract class BaseService implements IBaseService {
  protected userId: string;
  public db: LobeChatDatabase;
  private rbacModel: RbacModel;

  constructor(db: LobeChatDatabase, userId: string | null) {
    this.db = db;
    this.userId = userId || '';
    this.rbacModel = new RbacModel(db, this.userId);
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

  /**
   * 检查用户是否有全局权限all/workspace
   * @param permissionKey 权限键名
   * @returns 是否有权限
   */
  protected async hasGlobalPermission(
    permissionKey: keyof typeof PERMISSION_ACTIONS,
  ): Promise<boolean> {
    const result = await this.rbacModel.hasAnyPermission(
      [
        PERMISSION_ACTIONS[permissionKey] + ':all',
        PERMISSION_ACTIONS[permissionKey] + ':workspace',
      ],
      this.userId,
    );
    return result;
  }

  /**
   * 解析查询权限并返回查询条件
   * 用于处理数据访问权限的通用逻辑，支持以下场景：
   * 1. 查询自己的数据：永远允许
   * 2. 查询指定用户的数据：需要 all/workspace 权限
   * 3. 查询所有数据：需要 all/workspace 权限
   *
   * @param targetUserId - 目标用户 ID，可选。如果提供，表示要查询特定用户的数据
   * @param permissionKey - 权限键名数组
   * @returns 返回权限检查结果和查询条件
   *          - isPermitted: 是否允许查询
   *          - condition: 查询条件，包含 userId 过滤
   *          - message: 权限被拒绝时的错误信息
   */
  protected async resolveQueryPermission(
    targetUserId: string | undefined,
    permissionKey: keyof typeof PERMISSION_ACTIONS,
  ): Promise<{
    condition?: { userId?: string };
    isPermitted: boolean;
    message?: string;
  }> {
    // 检查是否有全局访问权限
    const hasGlobalAccess = await this.hasGlobalPermission(permissionKey);

    // 记录权限检查的上下文信息
    const logContext = {
      hasGlobalAccess,
      permissionKey,
      targetUserId,
      userId: this.userId,
    };

    // 场景 1: 查询特定用户的数据
    if (targetUserId) {
      // 如果是查询自己的数据，直接允许
      if (targetUserId === this.userId) {
        this.log('info', '允许查询：用户查询自己的数据', logContext);
        return {
          condition: { userId: targetUserId },
          isPermitted: true,
        };
      }

      // 如果要查询其他用户的数据，需要检查全局权限
      if (!hasGlobalAccess) {
        this.log('warn', '拒绝查询：没有查询其他用户数据的权限', logContext);
        return {
          isPermitted: false,
          message: '您没有权限查看其他用户的数据',
        };
      }

      this.log('info', '允许查询：用户具有全局查询权限', logContext);
      return {
        condition: { userId: targetUserId },
        isPermitted: true,
      };
    }

    // 场景 2: 查询所有数据（未指定目标用户）
    if (hasGlobalAccess) {
      this.log('info', '允许查询：用户具有全局查询权限，可查询所有数据', logContext);
      return { isPermitted: true };
    }

    // 场景 3: 默认只能查询自己的数据
    this.log('info', '限制查询：用户只能查询自己的数据', logContext);
    return {
      condition: { userId: this.userId },
      isPermitted: true,
    };
  }
}
