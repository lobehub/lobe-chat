import { and, desc, eq } from 'drizzle-orm/expressions';

import { aiModels, aiProviders } from '@/database/schemas';
import { LobeChatDatabase } from '@/database/type';

import { BaseService } from '../common/base.service';
import { ServiceResult } from '../types';
import {
  EnabledModelItem,
  GetEnabledModelsRequest,
  GetEnabledModelsResponse,
  ProviderWithModels,
} from '../types/model.type';

/**
 * 模型服务实现类 (Hono API 专用)
 * 提供启用模型的查询和分组功能
 */
export class ModelService extends BaseService {
  constructor(db: LobeChatDatabase, userId: string | null) {
    super(db, userId);
  }

  /**
   * 获取启用的模型并按 provider 分组
   * @param request 查询请求参数
   * @returns 按 provider 分组的启用模型列表
   */
  async getEnabledModelsByProvider(
    request: GetEnabledModelsRequest = {},
  ): ServiceResult<GetEnabledModelsResponse> {
    this.log('info', '获取启用模型列表并按 provider 分组', {
      type: request.type,
      userId: this.userId,
    });

    try {
      // 构建查询条件
      const whereConditions = [eq(aiModels.userId, this.userId!), eq(aiModels.enabled, true)];

      if (request.type) {
        whereConditions.push(eq(aiModels.type, request.type));
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

      // 按 provider 分组处理数据
      const providerMap = new Map<string, ProviderWithModels>();

      for (const row of result) {
        const providerId = row.providerId || row.modelId.split('-')[0] || 'unknown';

        // 创建模型项
        const modelItem: EnabledModelItem = {
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

      // 计算统计数据
      const totalProviders = providers.length;
      const totalModels = providers.reduce((sum, provider) => sum + provider.modelCount, 0);

      const response: GetEnabledModelsResponse = {
        providers,
        totalModels,
        totalProviders,
      };

      this.log('info', '获取启用模型列表完成', {
        totalModels,
        totalProviders,
        type: request.type,
      });

      return response;
    } catch (error) {
      this.log('error', '获取启用模型列表失败', { error, type: request.type });
      throw this.createCommonError('获取启用模型列表失败');
    }
  }
}
