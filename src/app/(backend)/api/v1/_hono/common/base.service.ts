import { eq } from 'drizzle-orm';
import { isEmpty } from 'lodash';

import { ALL, PERMISSION_ACTIONS } from '@/const/rbac';
import { RbacModel } from '@/database/models/rbac';
import { agents, sessions, topics } from '@/database/schemas';
import { LobeChatDatabase } from '@/database/type';

import { IBaseService, TTarget } from '../types';

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

  protected async getTargetUserId(target?: string | TTarget): Promise<string> {
    if (isEmpty(target)) {
      return '';
    }

    // 如果是字符串，直接返回（假设是 userId）
    if (typeof target === 'string') {
      return target;
    }

    try {
      switch (true) {
        // 查询 sessions 表
        case !!target?.targetSessionId: {
          const targetSession = await this.db.query.sessions.findFirst({
            where: eq(sessions.id, target.targetSessionId),
          });
          return targetSession?.userId || '';
        }

        // 查询 agents 表
        case !!target?.targetAgentId: {
          const targetAgent = await this.db.query.agents.findFirst({
            where: eq(agents.id, target.targetAgentId),
          });
          return targetAgent?.userId || '';
        }

        // 查询 topics 表
        case !!target?.targetTopicId: {
          const targetTopic = await this.db.query.topics.findFirst({
            where: eq(topics.id, target.targetTopicId),
          });
          return targetTopic?.userId || '';
        }

        default: {
          return '';
        }
      }
    } catch (error) {
      this.log('error', '获取目标用户ID失败', { error, target });
      return '';
    }
  }

  /**
   * 解析查询权限并返回查询条件
   * 用于处理数据访问权限的通用逻辑，支持以下场景：
   * 1. 查询自己的数据：永远允许
   * 2. 查询指定用户的数据：需要 all/workspace 权限
   * 3. 查询所有数据：需要 all/workspace 权限
   *
   * @param permissionKey - 权限键名
   * @param targetInfoId - 目标用户 ID，可选。传入字符串表示查询特定用户的数据，传入对象键值表示查询特定对象的数据
   * @param queryAll - 是否查询所有数据，可选。如果提供，表示要查询所有数据，否则只查询自己的数据
   * @returns 返回权限检查结果和查询条件
   *          - isPermitted: 是否允许查询
   *          - condition: 查询条件，包含 userId 过滤
   *          - message: 权限被拒绝时的错误信息
   */
  protected async resolveQueryPermission(
    permissionKey: keyof typeof PERMISSION_ACTIONS,
    targetInfoId?: string | TTarget | 'ALL',
  ): Promise<{
    condition?: { userId?: string };
    isPermitted: boolean;
    message?: string;
  }> {
    // 检查是否有全局访问权限
    const hasGlobalAccess = await this.hasGlobalPermission(permissionKey);
    const targetUserId = await this.getTargetUserId(targetInfoId);
    const queryAll = hasGlobalAccess && targetInfoId === ALL;
    this.log('info', '权限检查', { hasGlobalAccess, targetUserId });

    // 记录权限检查的上下文信息
    const logContext = {
      hasGlobalAccess,
      permissionKey,
      targetUserId,
      userId: this.userId,
    };

    // 场景 1: 查询特定用户的数据
    if (targetUserId && !queryAll) {
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
          message: '无权限',
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
      this.log(
        'info',
        '允许查询：用户具有全局查询权限，可查询所有数据 或 查询自己的数据',
        logContext,
      );
      if (queryAll) {
        return { isPermitted: true };
      } else {
        return { condition: { userId: this.userId }, isPermitted: true };
      }
    }

    // 场景 3: 默认只能查询自己的数据
    this.log('info', '限制查询：用户只能查询自己的数据', logContext);
    return {
      condition: { userId: this.userId },
      isPermitted: true,
    };
  }
}
