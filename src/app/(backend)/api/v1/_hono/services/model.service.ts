import { and, desc, eq, sql } from 'drizzle-orm';

import { LOBE_DEFAULT_MODEL_LIST } from '@/config/aiModels';
import { agents, agentsToSessions, aiModels, aiProviders } from '@/database/schemas';
import { LobeChatDatabase } from '@/database/type';

import { BaseService } from '../common/base.service';
import { ServiceResult } from '../types';
import {
  DatabaseModelItem,
  GetModelConfigBySessionRequest,
  GetModelConfigRequest,
  GetModelsRequest,
  GetModelsResponse,
  ModelConfigResponse,
  ModelItem,
  ProviderWithModels,
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
   * 获取模型列表（按 provider 分组）
   * @param request 查询请求参数
   * @returns 按 provider 分组的模型列表
   */
  async getModels(request: GetModelsRequest = {}): ServiceResult<GetModelsResponse> {
    this.log('info', '获取模型列表', {
      ...request,
      userId: this.userId,
    });

    try {
      // 构建查询条件
      const whereConditions = [eq(aiModels.userId, this.userId!)];

      if (request.type) {
        whereConditions.push(eq(aiModels.type, request.type));
      }

      if (typeof request.enabled === 'boolean') {
        whereConditions.push(eq(aiModels.enabled, request.enabled));
      }

      if (request.providerId) {
        whereConditions.push(eq(aiModels.providerId, request.providerId));
      }

      // 使用 JOIN 查询获取模型和对应的 provider 信息
      const result = await this.db
        .select({
          modelAbilities: aiModels.abilities,

          modelConfig: aiModels.config,

          modelContextWindowTokens: aiModels.contextWindowTokens,

          modelCreatedAt: aiModels.createdAt,

          modelDisplayName: aiModels.displayName,

          modelEnabled: aiModels.enabled,
          // 模型字段
          modelId: aiModels.id,
          modelProviderId: aiModels.providerId,
          modelSort: aiModels.sort,
          modelSource: aiModels.source,
          modelType: aiModels.type,
          modelUpdatedAt: aiModels.updatedAt,

          providerEnabled: aiProviders.enabled,
          // Provider 字段
          providerId: aiProviders.id,
          providerName: aiProviders.name,
          providerSort: aiProviders.sort,
        })
        .from(aiModels)
        .leftJoin(
          aiProviders,
          and(eq(aiModels.providerId, aiProviders.id), eq(aiProviders.userId, this.userId!)),
        )
        .where(and(...whereConditions))
        .orderBy(desc(aiProviders.sort), desc(aiModels.sort), aiModels.id);

      // 获取总数量
      const [countResult] = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(aiModels)
        .leftJoin(
          aiProviders,
          and(eq(aiModels.providerId, aiProviders.id), eq(aiProviders.userId, this.userId!)),
        )
        .where(and(...whereConditions));

      const total = Number(countResult.count);

      // 按 provider 分组处理数据
      const providerMap = new Map<string, ProviderWithModels>();

      for (const row of result) {
        const providerId = row.providerId || row.modelProviderId || 'unknown';

        // 创建模型项
        const modelItem: ModelItem = {
          abilities: row.modelAbilities as any,
          config: row.modelConfig as any,
          contextWindowTokens: row.modelContextWindowTokens || undefined,
          createdAt: row.modelCreatedAt.toISOString(),
          displayName: row.modelDisplayName || undefined,
          enabled: row.modelEnabled || false,
          id: row.modelId,
          sort: row.modelSort || undefined,
          source: (row.modelSource as any) || 'builtin',
          type: row.modelType,
          updatedAt: row.modelUpdatedAt.toISOString(),
        };

        // 如果 provider 不存在，创建新的
        if (!providerMap.has(providerId)) {
          providerMap.set(providerId, {
            modelCount: 0,
            models: [],
            providerEnabled: row.providerEnabled || false,
            providerId,
            providerName: row.providerName || undefined,
            providerSort: row.providerSort || undefined,
          });
        }

        // 添加模型到对应的 provider
        const provider = providerMap.get(providerId)!;
        provider.models.push(modelItem);
        provider.modelCount = provider.models.length;
      }

      // 转换为数组并排序
      const providers = Array.from(providerMap.values()).sort((a, b) => {
        // 先按 provider 启用状态排序（启用的在前）
        if (a.providerEnabled !== b.providerEnabled) {
          return a.providerEnabled ? -1 : 1;
        }
        // 再按 provider sort 排序
        const aSortValue = a.providerSort || 999;
        const bSortValue = b.providerSort || 999;
        return aSortValue - bSortValue;
      });

      const response: GetModelsResponse = {
        providers,
        totalModels: total,
        totalProviders: providers.length,
      };

      this.log('info', '获取模型列表完成', {
        totalModels: total,
        totalProviders: providers.length,
        type: request.type,
      });

      return response;
    } catch (error) {
      this.log('error', '获取模型列表失败', { error, request });
      throw this.createCommonError('获取模型列表失败');
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
      // 首先从数据库查询
      const dbModel = await this.getModelFromDatabase(request.provider, request.model);

      if (dbModel) {
        this.log('info', '从数据库获取模型配置成功', {
          model: request.model,
          provider: request.provider,
        });
        return this.convertDatabaseModelToResponse(dbModel);
      }

      // 如果数据库没有，从配置文件查询
      const configModel = this.getModelFromConfig(request.provider, request.model);

      if (configModel) {
        this.log('info', '从配置文件获取模型配置成功', {
          model: request.model,
          provider: request.provider,
        });
        return configModel;
      }

      this.log('warn', '未找到模型配置', { model: request.model, provider: request.provider });
      throw this.createNotFoundError(`未找到模型配置: ${request.provider}/${request.model}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('未找到模型配置')) {
        throw error;
      }
      this.log('error', '获取模型配置失败', { error, request });
      throw this.createCommonError('获取模型配置失败');
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
      const agentToSession = await this.db.query.agentsToSessions.findFirst({
        where: eq(agentsToSessions.sessionId, request.sessionId),
      });

      if (!agentToSession) {
        throw this.createNotFoundError(`会话对应的智能体关联不存在: ${request.sessionId}`);
      }

      const { agentId } = agentToSession;

      const agent = await this.db.query.agents.findFirst({
        where: eq(agents.id, agentId),
      });

      if (!agent) {
        throw this.createNotFoundError(`会话对应的智能体不存在: ${request.sessionId}`);
      }

      const { provider, model } = agent;

      // 检查agent是否有有效的model，对于provider为空的情况进行处理
      if (!model) {
        throw this.createNotFoundError(`智能体缺少模型配置: model=${model}`);
      }

      // 如果provider为空，尝试从LOBE_DEFAULT_MODEL_LIST中推断provider
      let actualProvider = provider;
      if (!actualProvider && model) {
        const defaultModel = LOBE_DEFAULT_MODEL_LIST.find((item) => item.id === model);
        if (defaultModel) {
          actualProvider = defaultModel.providerId;
        }
      }

      if (!actualProvider) {
        throw this.createNotFoundError(`无法确定模型提供商: model=${model}`);
      }

      let databaseModel = await this.getModelFromDatabase(actualProvider, model);

      let modelConfig: ModelConfigResponse | null = null;

      // 如果数据库中找到了模型，转换为响应格式
      if (databaseModel) {
        modelConfig = this.convertDatabaseModelToResponse(databaseModel);
      } else {
        // 如果数据库中没有找到，尝试从配置文件中获取
        modelConfig = this.getModelFromConfig(actualProvider, model);
      }

      if (!modelConfig) {
        throw this.createNotFoundError(`会话对应的模型不存在: ${request.sessionId}`);
      }

      return modelConfig;
    } catch (error) {
      this.log('error', '根据会话ID获取模型配置失败', { error, request });
      throw this.createCommonError('根据会话ID获取模型配置失败');
    }
  }

  /**
   * 从数据库查询模型
   */
  private async getModelFromDatabase(
    providerId: string,
    modelId: string,
  ): Promise<DatabaseModelItem | null> {
    try {
      const result = await this.db.query.aiModels.findFirst({
        where: and(
          eq(aiModels.userId, this.userId!),
          eq(aiModels.providerId, providerId),
          eq(aiModels.id, modelId),
        ),
      });

      return result as DatabaseModelItem | null;
    } catch (error) {
      this.log('error', '数据库查询模型失败', { error, modelId, providerId });
      return null;
    }
  }

  /**
   * 从配置文件查询模型
   */
  private getModelFromConfig(providerId: string, modelId: string): ModelConfigResponse | null {
    try {
      const model = LOBE_DEFAULT_MODEL_LIST.find(
        (item) => item.providerId === providerId && item.id === modelId,
      );

      if (!model) {
        return null;
      }

      return {
        ...model,
        providerId: model.providerId,
        source: 'builtin',
      };
    } catch (error) {
      this.log('error', '配置文件查询模型失败', { error, modelId, providerId });
      return null;
    }
  }

  /**
   * 将数据库模型转换为响应格式
   */
  private convertDatabaseModelToResponse(dbModel: DatabaseModelItem): ModelConfigResponse {
    return {
      abilities: dbModel.abilities || {},
      config: dbModel.config,
      contextWindowTokens: dbModel.contextWindowTokens,
      description: dbModel.description,
      displayName: dbModel.displayName,
      enabled: dbModel.enabled,
      id: dbModel.id,
      organization: dbModel.organization,
      pricing: dbModel.pricing,
      providerId: dbModel.providerId,
      releasedAt: dbModel.releasedAt,
      source: (dbModel.source as any) || 'custom',
      type: dbModel.type as any,
    };
  }
}
