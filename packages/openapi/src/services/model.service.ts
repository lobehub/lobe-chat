import { and, asc, count, desc, eq } from 'drizzle-orm';

import { agents, agentsToSessions, aiModels } from '@/database/schemas';
import { LobeChatDatabase } from '@/database/type';

import { BaseService } from '../common/base.service';
import { ServiceResult } from '../types';
import {
  GetModelConfigBySessionRequest,
  GetModelConfigRequest,
  GetModelsResponse,
  ModelConfigResponse,
  ModelsListQuery,
} from '../types/model.type';

/**
 * 模型服务实现类 (Hono API 专用)
 * 提供模型的查询和分组功能
 */
export class ModelService extends BaseService {
  constructor(db: LobeChatDatabase, userId: string | null) {
    super(db, userId);
  }

  /**
   * 获取模型列表
   * @param request 查询请求参数
   */
  async getModels(request: ModelsListQuery = {}): ServiceResult<GetModelsResponse> {
    this.log('info', '获取模型列表', {
      ...request,
      userId: this.userId,
    });

    try {
      // 权限校验
      const permissionResult = await this.resolveOperationPermission('AI_MODEL_READ');

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '无权访问模型列表');
      }

      const { limit, order, page, provider, sort, type, enabled } = request;

      // 构建查询条件 - 优化：避免嵌套 and 条件
      const conditions = [];

      if (provider) {
        conditions.push(eq(aiModels.providerId, provider));
      }

      if (type) {
        conditions.push(eq(aiModels.type, type));
      }

      if (typeof enabled === 'boolean') {
        conditions.push(eq(aiModels.enabled, enabled));
      }

      // 权限条件直接加入主条件数组
      if (permissionResult.condition?.userId) {
        conditions.push(eq(aiModels.userId, permissionResult.condition.userId));
      }

      // 构建排序条件 - 优化：支持标准排序字段
      let sortField;
      switch (sort) {
        case 'createdAt': {
          sortField = aiModels.createdAt;
          break;
        }
        case 'updatedAt': {
          sortField = aiModels.updatedAt;
          break;
        }
        case 'sort': {
          sortField = aiModels.sort;
          break;
        }
        default: {
          break;
        }
      }

      // 构建分页条件 - 优化：添加边界检查
      const safeLimit = Math.min(100, Math.max(1, limit ?? 10)); // 限制在 1-100 之间
      const safePage = Math.max(1, page ?? 1);
      const offset = (safePage - 1) * safeLimit;

      const finalWhereCondition = conditions.length > 0 ? and(...conditions) : undefined;

      // 并行执行查询和计数 - 优化：减少等待时间
      const [result, totalResult] = await Promise.all([
        this.db.query.aiModels.findMany({
          limit: safeLimit,
          offset: offset,
          orderBy: sortField ? (order === 'asc' ? asc(sortField) : desc(sortField)) : undefined,
          where: finalWhereCondition,
        }),
        this.db.select({ count: count() }).from(aiModels).where(finalWhereCondition),
      ]);

      const totalModels = totalResult[0]?.count ?? 0;

      return {
        models: result,
        totalModels,
      };
    } catch (error) {
      this.handleServiceError(error, '获取模型列表失败');
    }
  }

  /**
   * 根据 provider 和 model 名称获取模型配置
   * 优先从数据库查询，如果没有找到则从配置文件查询
   * @param request 查询请求参数
   * @returns 模型配置信息
   */
  async getModelConfig(request: GetModelConfigRequest): ServiceResult<ModelConfigResponse> {
    this.log('info', '获取模型配置', {
      ...request,
      userId: this.userId,
    });

    try {
      // 权限校验
      const permissionResult = await this.resolveOperationPermission('AI_MODEL_READ', {
        targetModelId: request.model,
      });

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '无权访问此模型配置');
      }

      // 构建查询条件
      const conditions = [
        eq(aiModels.providerId, request.provider),
        eq(aiModels.id, request.model),
      ];

      // 权限条件处理 - 根据权限结果添加用户限制
      if (permissionResult.condition?.userId) {
        // 如果权限校验返回了特定用户ID限制，只查询该用户的模型
        conditions.push(eq(aiModels.userId, permissionResult.condition.userId));
      }

      // 首先从数据库查询
      const model = await this.db.query.aiModels.findFirst({
        where: and(...conditions),
      });

      if (!model) {
        this.log('warn', '模型配置不存在', {
          hasUserRestriction: !!permissionResult.condition?.userId,
          model: request.model,
          provider: request.provider,
        });
        throw this.createNotFoundError(`未找到模型配置: ${request.provider}/${request.model}`);
      }

      this.log('info', '从数据库获取模型配置成功', {
        model: request.model,
        provider: request.provider,
      });

      return model;
    } catch (error) {
      this.handleServiceError(error, '获取模型配置失败');
    }
  }

  /**
   * 根据会话ID获取模型配置
   * @param request 查询请求参数
   * @returns 模型配置信息
   */
  async getModelConfigBySession(
    request: GetModelConfigBySessionRequest,
  ): ServiceResult<ModelConfigResponse> {
    this.log('info', '根据会话ID获取模型配置', {
      ...request,
      userId: this.userId,
    });

    try {
      // 权限校验 - 需要同时有 SESSION_READ 和 AI_MODEL_READ 权限
      const sessionPermission = await this.resolveOperationPermission('SESSION_READ', {
        targetSessionId: request.sessionId,
      });

      if (!sessionPermission.isPermitted) {
        throw this.createAuthorizationError(sessionPermission.message || '无权访问此会话');
      }

      const modelPermission = await this.resolveOperationPermission('AI_MODEL_READ');

      if (!modelPermission.isPermitted) {
        throw this.createAuthorizationError(modelPermission.message || '无权访问模型配置');
      }

      // 构建查询条件
      const conditions = [eq(agentsToSessions.sessionId, request.sessionId)];

      // 添加会话权限条件
      if (sessionPermission.condition?.userId) {
        conditions.push(eq(agentsToSessions.userId, sessionPermission.condition.userId));
      }

      // 添加模型权限条件
      if (modelPermission.condition?.userId) {
        conditions.push(eq(aiModels.userId, modelPermission.condition.userId));
      }

      // 使用 JOIN 查询一次性获取所有相关数据，避免 N+1 查询
      const targetModel = await this.db
        .select({
          agent: agents,
          model: aiModels, // 额外返回 agent 信息用于日志
        })
        .from(agentsToSessions)
        .innerJoin(agents, eq(agentsToSessions.agentId, agents.id))
        .innerJoin(
          aiModels,
          and(
            eq(agents.model, aiModels.id),
            eq(agents.provider, aiModels.providerId), // 确保 provider 也匹配
          ),
        )
        .where(and(...conditions))
        .limit(1);

      if (!targetModel.length) {
        this.log('warn', '会话对应的模型配置不存在', {
          hasModelRestriction: !!modelPermission.condition?.userId,
          hasSessionRestriction: !!sessionPermission.condition?.userId,
          sessionId: request.sessionId,
        });
        throw this.createNotFoundError(`会话对应的模型不存在: ${request.sessionId}`);
      }

      const { model, agent } = targetModel[0];

      this.log('info', '从数据库获取会话模型配置成功', {
        agentId: agent.id,
        modelId: model.id,
        providerId: model.providerId,
        sessionId: request.sessionId,
      });

      return model;
    } catch (error) {
      this.handleServiceError(error, '根据会话ID获取模型配置失败');
    }
  }
}
