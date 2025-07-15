import { eq, inArray } from 'drizzle-orm';
import { isEmpty } from 'lodash';

import { ALL, PERMISSION_ACTIONS } from '@/const/rbac';
import { RbacModel } from '@/database/models/rbac';
import { agents, sessions, topics } from '@/database/schemas';
import { LobeChatDatabase } from '@/database/type';

import { IBaseService, TTarget, TBatchTarget } from '../types';
import { getActionType, getResourceType } from '../utils/permission';

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
   * 检查用户是否有 owner 权限
   * @param permissionKey 权限键名
   * @returns 是否有权限
   */
  protected async hasOwnerPermission(
    permissionKey: keyof typeof PERMISSION_ACTIONS,
  ): Promise<boolean> {
    const result = await this.rbacModel.hasAnyPermission(
      [PERMISSION_ACTIONS[permissionKey] + ':owner'],
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
   * 解析权限并返回目标信息
   * 用于处理数据访问权限的通用逻辑，支持以下场景：
   * 1. 查询/操作当前用户的数据：需要 all/workspace/owner 权限
   * 2. 查询/操作指定用户的数据：需要 all/workspace 权限
   * 3. 查询/操作所有数据：需要 all/workspace 权限
   *
   * @param permissionKey - 权限键名
   * @param targetInfoId - 目标ID，可选。传入字符串表示查询/操作特定用户的数据，传入对象键值表示查询/操作特定对象的数据
   * @param queryAll - 是否查询所有数据，可选。如果提供，表示要查询所有数据，否则只查询当前用户的数据
   * @returns 返回权限检查结果和查询/操作条件
   *          - isPermitted: 是否允许查询/操作
   *          - condition: 目标信息，包含 userId 过滤条件
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
    const hasOwnerAccess = await this.hasOwnerPermission(permissionKey);
    const targetUserId = await this.getTargetUserId(targetInfoId);
    const queryAll = hasGlobalAccess && targetInfoId === ALL;
    const resourceType = getResourceType(permissionKey);
    const actionType = getActionType(permissionKey);
    this.log('info', '权限检查', { hasGlobalAccess, targetUserId });

    // 记录权限检查的上下文信息
    const logContext = {
      hasGlobalAccess,
      permissionKey,
      targetUserId,
      userId: this.userId,
    };

    // 场景 1: 查询/操作特定用户的数据
    if (targetUserId && !queryAll) {
      // 如果是查询/操作当前用户的数据，直接允许
      if (targetUserId === this.userId && hasOwnerAccess) {
        this.log(
          'info',
          `权限通过：当前user拥有${resourceType}的owner级别${actionType}权限`,
          logContext,
        );
        return {
          condition: { userId: targetUserId },
          isPermitted: true,
        };
      }

      // 如果要查询/操作其他用户的数据，需要检查全局权限
      if (!hasGlobalAccess) {
        this.log(
          'warn',
          `权限拒绝：当前user没有${resourceType}的all/workspace级别${actionType}权限`,
          logContext,
        );
        return {
          isPermitted: false,
          message: `no permission,current user has no ${resourceType} ${actionType} all/workspace permission`,
        };
      }

      this.log(
        'info',
        `权限通过：当前user拥有${resourceType}的all/workspace级别${actionType}权限`,
        logContext,
      );
      return {
        condition: { userId: targetUserId },
        isPermitted: true,
      };
    }

    // 场景 2: 查询/操作所有数据
    if (queryAll) {
      if (hasGlobalAccess) {
        this.log(
          'info',
          `权限通过：当前user拥有${resourceType}的all/workspace级别${actionType}权限`,
          logContext,
        );
        return { isPermitted: true };
      } else {
        this.log(
          'info',
          `权限拒绝：当前user没有${resourceType}的all/workspace级别${actionType}权限`,
          logContext,
        );
        return {
          isPermitted: false,
          message: `no permission,current user has no ${resourceType} ${actionType} all/workspace permission`,
        };
      }
    }

    // 场景 3: 默认只能查询/操作当前用户的数据
    if (!hasOwnerAccess) {
      this.log(
        'info',
        `权限拒绝：当前user没有${resourceType}的owner级别${actionType}权限`,
        logContext,
      );
      return {
        isPermitted: false,
        message: `no permission,current user has no ${resourceType} ${actionType} owner permission`,
      };
    }

    this.log(
      'info',
      `权限通过：当前user拥有${resourceType}的owner级别${actionType}权限`,
      logContext,
    );
    return {
      condition: { userId: this.userId },
      isPermitted: true,
    };
  }

  /**
   * 解析批量操作的权限
   * 用于处理批量数据访问权限的通用逻辑
   * 1. 批量操作必须要有 all/workspace 权限
   * 2. 如果所有资源都属于当前用户，且有 owner 权限，也允许操作
   * 3. 如果有 all/workspace 权限，允许操作所有指定的资源
   *
   * @param permissionKey - 权限键名
   * @param targetInfoIds - 目标资源 ID 数组
   * @returns 返回权限检查结果
   */
  protected async resolveBatchQueryPermission(
    permissionKey: keyof typeof PERMISSION_ACTIONS,
    targetInfoIds: TBatchTarget,
  ): Promise<{
    isPermitted: boolean;
    message?: string;
  }> {
    const hasGlobalAccess = await this.hasGlobalPermission(permissionKey);
    const hasOwnerAccess = await this.hasOwnerPermission(permissionKey);
    const resourceType = getResourceType(permissionKey);
    const actionType = getActionType(permissionKey);

    // 获取所有资源的用户 ID
    let userIds: string[] = [];
    try {
      // 根据 targetInfoIds 中的属性自动判断资源类型
      switch (true) {
        case !!targetInfoIds.targetSessionId?.length: {
          const sessionList = await this.db.query.sessions.findMany({
            where: inArray(sessions.id, targetInfoIds.targetSessionId),
          });
          userIds = sessionList.map((s) => s.userId);
          break;
        }
        case !!targetInfoIds.targetAgentId?.length: {
          const agentList = await this.db.query.agents.findMany({
            where: inArray(agents.id, targetInfoIds.targetAgentId),
          });
          userIds = agentList.map((a) => a.userId);
          break;
        }
        case !!targetInfoIds.targetTopicId?.length: {
          const topicList = await this.db.query.topics.findMany({
            where: inArray(topics.id, targetInfoIds.targetTopicId),
          });
          userIds = topicList.map((t) => t.userId);
          break;
        }
        default: {
          return {
            isPermitted: false,
            message: '未提供有效的资源 ID',
          };
        }
      }
    } catch (error) {
      this.log('error', '获取目标用户ID失败', { error, targetInfoIds });
      return {
        isPermitted: false,
        message: '获取资源信息失败',
      };
    }

    // 记录权限检查的上下文信息
    const logContext = {
      hasGlobalAccess,
      hasOwnerAccess,
      permissionKey,
      targetInfoIds,
      userIds,
    };

    // 如果找不到任何资源
    if (userIds.length === 0) {
      this.log('warn', '未找到任何目标资源', logContext);
      return {
        isPermitted: false,
        message: '未找到任何目标资源',
      };
    }

    // 如果有全局权限，允许操作所有指定的资源
    if (hasGlobalAccess) {
      this.log(
        'info',
        `权限通过：批量操作，当前user拥有${resourceType}的all/workspace级别${actionType}权限`,
        logContext,
      );
      return { isPermitted: true };
    }

    // 如果所有资源都属于当前用户，且有 owner 权限
    const allBelongToCurrentUser = userIds.every((id) => id === this.userId);
    if (allBelongToCurrentUser && hasOwnerAccess) {
      this.log(
        'info',
        `权限通过：批量操作，所有资源属于当前用户，且拥有${resourceType}的owner级别${actionType}权限`,
        logContext,
      );
      return { isPermitted: true };
    }

    // 其他情况不允许批量操作
    this.log(
      'warn',
      `权限拒绝：批量操作需要${resourceType}的all/workspace级别${actionType}权限`,
      logContext,
    );
    return {
      isPermitted: false,
      message: `no permission for batch operation, current user has no ${resourceType} ${actionType} all/workspace permission`,
    };
  }

  /**
   * 检查用户是否拥有聊天相关的所有必要权限
   * 包括：
   * - 消息读写权限 (MESSAGE_READ, MESSAGE_WRITE)
   * - 话题读写权限 (TOPIC_READ, TOPIC_WRITE)
   * - 会话读写权限 (SESSION_READ, SESSION_WRITE)
   * - AI 模型读权限 (AI_MODEL_READ)
   * - 助手读权限 (AGENT_READ)
   * - 文件读权限 (FILE_READ)
   *
   * @returns 返回权限检查结果和缺失的权限列表
   */
  protected async resolveChatPermissions(): Promise<{
    isPermitted: boolean;
    message?: string;
    missingPermissions: string[];
  }> {
    const requiredPermissions = [
      'MESSAGE_READ',
      'MESSAGE_CREATE',
      'TOPIC_READ',
      'TOPIC_CREATE',
      'SESSION_READ',
      'SESSION_CREATE',
      'AI_MODEL_READ',
      'AGENT_READ',
      'FILE_READ',
    ] as const;

    const permissionResults = await Promise.all(
      requiredPermissions.map(async (permission) => {
        const result = await this.resolveQueryPermission(permission);
        return {
          isPermitted: result.isPermitted,
          permission,
        };
      }),
    );

    const missingPermissions = permissionResults
      .filter((result) => !result.isPermitted)
      .map((result) => {
        const resourceType = getResourceType(result.permission);
        const actionType = getActionType(result.permission);
        return `${resourceType} ${actionType}`;
      });

    const isPermitted = missingPermissions.length === 0;

    this.log('info', '聊天权限检查', {
      isPermitted,
      missingPermissions,
      userId: this.userId,
    });

    if (!isPermitted) {
      return {
        isPermitted: false,
        message: `缺少必要权限：${missingPermissions.join(', ')}`,
        missingPermissions,
      };
    }

    return {
      isPermitted: true,
      missingPermissions: [],
    };
  }
}
