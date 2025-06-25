import { and, eq } from 'drizzle-orm';

import { aiModels } from '@/database/schemas';
import { LobeChatDatabase } from '@/database/type';
import { AIChatModelCard, AiModelSourceEnum } from '@/types/aiModel';

import { BaseService } from '../common/base.service';
import { ModelAbilities, ServiceResult } from '../types';
import { GetModelDetailsRequest, ModelDetailsResponse } from '../types/ai-infra.type';

export class AiInfraService extends BaseService {
  constructor(db: LobeChatDatabase, userId: string | null) {
    super(db, userId);
  }

  /**
   * 获取模型详情配置信息
   * @param request 包含 model 和 provider 的请求参数
   * @returns 模型的基础配置信息
   */
  async getModelDetails(request: GetModelDetailsRequest): ServiceResult<ModelDetailsResponse> {
    const { model, provider } = request;

    this.log('info', '获取模型详情', { model, provider, userId: this.userId });

    try {
      // 首先尝试从数据库查询用户自定义的模型配置
      const modelData = await this.db.query.aiModels.findFirst({
        where: and(eq(aiModels.id, model), eq(aiModels.providerId, provider)),
      });

      let finalModelData = modelData;

      // 如果数据库中没有找到，尝试从内置配置中加载
      if (!modelData) {
        this.log('info', '数据库中未找到模型配置，尝试加载内置配置', { model, provider });

        try {
          // 动态导入指定提供商的内置模型配置
          const { default: providerModels } = await import(`@/config/aiModels/${provider}`);

          // 查找指定的模型
          const builtinModel = (providerModels as AIChatModelCard[]).find(
            (m: AIChatModelCard) => m.id === model,
          );

          if (builtinModel) {
            this.log('info', '找到内置模型配置', { model, provider });

            // 转换为数据库格式的模型数据
            finalModelData = {
              abilities: builtinModel.abilities || {},
              accessedAt: new Date(),
              config: null,
              contextWindowTokens: builtinModel.contextWindowTokens || null,
              createdAt: new Date(),
              description: builtinModel.description || null,
              displayName: builtinModel.displayName || null,
              enabled: builtinModel.enabled || false,
              id: builtinModel.id,
              organization: null,
              parameters: {},
              pricing: builtinModel.pricing ? JSON.stringify(builtinModel.pricing) : null,
              providerId: provider,
              releasedAt: builtinModel.releasedAt || null,
              sort: null,
              source: AiModelSourceEnum.Builtin,
              type: builtinModel.type,
              updatedAt: new Date(),
              userId: this.userId || '',
            };
          } else {
            this.log('warn', '内置配置中未找到指定模型', { model, provider });
          }
        } catch (error) {
          // 可能提供商ID不存在或配置文件不存在
          this.log('warn', '加载内置模型配置失败', {
            error: error instanceof Error ? error.message : String(error),
            model,
            provider,
          });
        }
      }

      // 如果最终还是没有找到模型数据，返回默认值
      if (!finalModelData) {
        this.log('warn', '未找到模型配置，返回默认值', { model, provider });

        return {
          contextWindowTokens: undefined,
          hasContextWindowToken: false,
          model,
          provider,
          supportFiles: false,
          supportReasoning: false,
          supportToolUse: false,
          supportVision: false,
        };
      }

      // 提取模型能力信息
      const abilities = finalModelData.abilities as ModelAbilities;
      const contextWindowTokens = finalModelData.contextWindowTokens;
      const hasContextWindowToken = typeof contextWindowTokens === 'number';

      const response: ModelDetailsResponse = {
        contextWindowTokens,
        hasContextWindowToken,
        model,
        provider,
        supportFiles: !!abilities?.files,
        supportReasoning: !!abilities?.reasoning,
        supportToolUse: !!abilities?.functionCall,
        supportVision: !!abilities?.vision,
      };

      this.log('info', '成功获取模型详情', { model, provider, response });

      return response;
    } catch (error) {
      this.log('error', '获取模型详情失败', {
        error: error instanceof Error ? error.message : String(error),
        model,
        provider,
      });

      throw this.createCommonError('获取模型详情失败');
    }
  }
}
