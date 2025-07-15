import { and, eq } from 'drizzle-orm';

import { LOBE_DEFAULT_MODEL_LIST } from '@/config/aiModels';
import { DEFAULT_MODEL_PROVIDER_LIST } from '@/config/modelProviders';
import { agents, agentsToSessions, aiModels, aiProviders } from '@/database/schemas';
import { LobeChatDatabase } from '@/database/type';
import { AIChatModelCard, AiModelSourceEnum, AiProviderModelListItem } from '@/types/aiModel';
import { AiProviderListItem } from '@/types/aiProvider';
import { mergeArrayById } from '@/utils/merge';

import { BaseService } from '../common/base.service';
import { ServiceResult } from '../types';
import {
  DatabaseModelItem,
  GetModelConfigBySessionRequest,
  GetModelConfigRequest,
  GetModelsRequest,
  GetModelsResponse,
  ModelConfigResponse,
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
   * 优先从已启用的提供商中获取内置模型配置，然后与数据库中的用户自定义配置合并
   * @param request 查询请求参数
   * @returns 按 provider 分组的模型列表
   */
  async getModels(request: GetModelsRequest = {}): ServiceResult<GetModelsResponse> {
    this.log('info', '获取模型列表', {
      ...request,
      userId: this.userId,
    });

    try {
      // 权限校验
      const permissionResult = await this.resolveQueryPermission('AI_MODEL_READ');

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '无权访问模型列表');
      }

      // 1. 获取已启用的提供商列表
      const enabledProviders = await this.getEnabledProviders(permissionResult.condition?.userId);

      // 2. 按 provider 分组处理数据
      const providerMap = new Map<string, ProviderWithModels>();
      let totalModels = 0;

      // 3. 遍历每个已启用的提供商
      for (const provider of enabledProviders) {
        const providerId = provider.id;

        // 3.1 获取该提供商的内置模型配置
        const builtinModels = await this.fetchBuiltinModels(providerId);

        // 3.2 获取数据库中该提供商的用户自定义模型配置
        const userModels = await this.getUserModels(providerId, permissionResult.condition?.userId);

        // 3.3 合并内置配置和用户配置（用户配置优先）
        const mergedModels = mergeArrayById(builtinModels, userModels);

        // 3.4 根据请求参数过滤模型（排除provider过滤，在这里单独处理）
        const filteredModels = this.filterModels(mergedModels, { ...request, provider: undefined });

        if (filteredModels.length > 0) {
          totalModels += filteredModels.length;
          providerMap.set(providerId, {
            modelCount: filteredModels.length,
            models: filteredModels as any[], // 临时类型转换
            providerEnabled: provider.enabled,
            providerId: provider.id,
            providerName: provider.name,
            providerSort: provider.sort,
          });
        }
      }

      // 4. 按请求参数过滤 provider
      let finalProviderMap = providerMap;
      if (request.provider) {
        const filteredMap = new Map<string, ProviderWithModels>();
        if (providerMap.has(request.provider)) {
          filteredMap.set(request.provider, providerMap.get(request.provider)!);
          totalModels = providerMap.get(request.provider)!.modelCount;
        } else {
          totalModels = 0;
        }
        finalProviderMap = filteredMap;
      }

      // 5. 根据 groupedByProvider 决定返回格式
      if (request.groupedByProvider !== false) {
        // 分组返回（默认行为）
        const providers = Array.from(finalProviderMap.values()).sort((a, b) => {
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
          totalModels,
          totalProviders: providers.length,
        };

        this.log('info', '获取模型列表完成（分组模式）', {
          totalModels,
          totalProviders: providers.length,
          type: request.type,
        });

        return response;
      } else {
        // 扁平化返回
        const allModels = finalProviderMap.values().reduce((acc, provider) => {
          const { providerId, providerName } = provider;

          return acc.concat(
            provider.models.map((model) => ({
              ...model,
              providerId,
              providerName,
            })),
          );
        }, [] as any[]);

        // 按模型排序
        allModels.sort((a, b) => {
          const aSort = a.sort || 999;
          const bSort = b.sort || 999;
          return aSort - bSort;
        });

        const response: GetModelsResponse = {
          models: allModels,
          totalModels: allModels.length,
          totalProviders: finalProviderMap.size,
        };

        this.log('info', '获取模型列表完成（扁平化模式）', {
          totalModels: allModels.length,
          totalProviders: finalProviderMap.size,
          type: request.type,
        });

        return response;
      }
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
      // 权限校验
      const permissionResult = await this.resolveQueryPermission('AI_MODEL_READ', {
        targetModelId: request.model,
      });

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '无权访问此模型配置');
      }

      // 首先从数据库查询
      const dbModel = await this.getModelFromDatabase(
        request.provider,
        request.model,
        permissionResult.condition?.userId,
      );

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
      // 权限校验 - 需要同时有 MODEL_READ 和 SESSION_READ 权限
      const [modelPermission, sessionPermission] = await Promise.all([
        this.resolveQueryPermission('AI_MODEL_READ'),
        this.resolveQueryPermission('SESSION_READ', {
          targetSessionId: request.sessionId,
        }),
      ]);

      if (!modelPermission.isPermitted) {
        throw this.createAuthorizationError(modelPermission.message || '无权访问模型配置');
      }

      if (!sessionPermission.isPermitted) {
        throw this.createAuthorizationError(sessionPermission.message || '无权访问此会话');
      }

      const agentToSession = await this.db.query.agentsToSessions.findFirst({
        where: and(
          eq(agentsToSessions.sessionId, request.sessionId),
          sessionPermission.condition?.userId
            ? eq(agentsToSessions.userId, sessionPermission.condition.userId)
            : undefined,
        ),
      });

      if (!agentToSession) {
        throw this.createNotFoundError(`会话对应的智能体关联不存在: ${request.sessionId}`);
      }

      const { agentId } = agentToSession;

      const agent = await this.db.query.agents.findFirst({
        where: and(
          eq(agents.id, agentId),
          sessionPermission.condition?.userId
            ? eq(agents.userId, sessionPermission.condition.userId)
            : undefined,
        ),
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

      let databaseModel = await this.getModelFromDatabase(
        actualProvider,
        model,
        modelPermission.condition?.userId,
      );

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
    userId?: string,
  ): Promise<DatabaseModelItem | null> {
    try {
      const result = await this.db.query.aiModels.findFirst({
        where: and(
          eq(aiModels.providerId, providerId),
          eq(aiModels.id, modelId),
          userId ? eq(aiModels.userId, userId) : undefined,
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

  /**
   * 获取已启用的提供商列表
   */
  private async getEnabledProviders(userId?: string): Promise<AiProviderListItem[]> {
    // 获取数据库中用户配置的提供商
    const userProviders = await this.db
      .select({
        description: aiProviders.description,
        enabled: aiProviders.enabled,
        id: aiProviders.id,
        logo: aiProviders.logo,
        name: aiProviders.name,
        sort: aiProviders.sort,
        source: aiProviders.source,
      })
      .from(aiProviders)
      .where(userId ? eq(aiProviders.userId, userId) : undefined)
      .orderBy(aiProviders.sort, aiProviders.id);

    // 创建基于 DEFAULT_MODEL_PROVIDER_LIST 的排序映射
    const orderMap = new Map(DEFAULT_MODEL_PROVIDER_LIST.map((item, index) => [item.id, index]));

    // 构建内置提供商列表
    const builtinProviders = DEFAULT_MODEL_PROVIDER_LIST.map((item, index) => ({
      description: item.description,
      enabled: userProviders.some((provider) => provider.id === item.id && provider.enabled),
      id: item.id,
      logo: undefined, // ModelProviderCard 没有 logo 属性
      name: item.name,
      sort: index, // 使用索引作为排序
      source: 'builtin' as const,
    })) as AiProviderListItem[];

    // 合并内置和用户配置的提供商
    const userProvidersFormatted = userProviders.map((p) => ({
      ...p,
      description: p.description ?? undefined,
      enabled: p.enabled ?? false,
      logo: p.logo ?? undefined,
      name: p.name ?? undefined,
      sort: p.sort ?? 999,
      source: p.source ?? ('custom' as const),
    }));
    const mergedProviders = mergeArrayById(builtinProviders, userProvidersFormatted);

    // 过滤出已启用的提供商并按顺序排序
    return mergedProviders
      .filter((provider) => provider.enabled)
      .sort((a, b) => {
        const orderA = orderMap.get(a.id) ?? Number.MAX_SAFE_INTEGER;
        const orderB = orderMap.get(b.id) ?? Number.MAX_SAFE_INTEGER;
        return orderA - orderB;
      });
  }

  /**
   * 获取指定提供商的内置模型配置
   */
  private async fetchBuiltinModels(providerId: string): Promise<AiProviderModelListItem[]> {
    try {
      const { default: providerModels } = await import(`@/config/aiModels/${providerId}`);
      return (providerModels as AIChatModelCard[]).map<AiProviderModelListItem>((m) => ({
        ...m,
        enabled: m.enabled || false,
        source: AiModelSourceEnum.Builtin,
      }));
    } catch (error) {
      this.log('warn', `无法加载提供商 ${providerId} 的内置模型配置`, { error });
      return [];
    }
  }

  /**
   * 获取指定提供商的用户自定义模型配置
   */
  private async getUserModels(providerId: string, userId?: string): Promise<AiProviderModelListItem[]> {
    const result = await this.db
      .select({
        abilities: aiModels.abilities,
        config: aiModels.config,
        contextWindowTokens: aiModels.contextWindowTokens,
        description: aiModels.description,
        displayName: aiModels.displayName,
        enabled: aiModels.enabled,
        id: aiModels.id,
        pricing: aiModels.pricing,
        releasedAt: aiModels.releasedAt,
        source: aiModels.source,
        type: aiModels.type,
      })
      .from(aiModels)
      .where(and(
        eq(aiModels.providerId, providerId),
        userId ? eq(aiModels.userId, userId) : undefined,
      ))
      .orderBy(aiModels.sort, aiModels.id);

    return result as AiProviderModelListItem[];
  }

  /**
   * 根据请求参数过滤模型
   */
  private filterModels(
    models: AiProviderModelListItem[],
    request: GetModelsRequest,
  ): AiProviderModelListItem[] {
    let filtered = models;

    // 按类型过滤
    if (request.type) {
      filtered = filtered.filter((model) => model.type === request.type);
    }

    // 按启用状态过滤
    if (typeof request.enabled === 'boolean') {
      // 明确指定了 enabled 参数
      filtered = filtered.filter((model) => model.enabled === request.enabled);
    }

    // 按模型排序
    return filtered.sort((a, b) => {
      const aSort = (a as any).sort || 999;
      const bSort = (b as any).sort || 999;
      return aSort - bSort;
    });
  }
}
