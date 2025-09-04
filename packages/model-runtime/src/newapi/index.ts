import urlJoin from 'url-join';

import { createRouterRuntime } from '../RouterRuntime';
import { responsesAPIModels } from '../const/models';
import { ModelProvider } from '../types';
import { ChatStreamPayload } from '../types/chat';
import { detectModelProvider, processMultiProviderModelList } from '../utils/modelParse';

export interface NewAPIModelCard {
  created: number;
  id: string;
  object: string;
  owned_by: string;
  supported_endpoint_types?: string[];
}

export interface NewAPIPricing {
  completion_ratio?: number;
  enable_groups: string[];
  model_name: string;
  model_price?: number;
  model_ratio?: number;
  quota_type: number; // 0: 按量计费, 1: 按次计费
  supported_endpoint_types?: string[];
}

const handlePayload = (payload: ChatStreamPayload) => {
  // 处理 OpenAI responses API 模式
  if (
    responsesAPIModels.has(payload.model) ||
    payload.model.includes('gpt-') ||
    /^o\d/.test(payload.model)
  ) {
    return { ...payload, apiMode: 'responses' } as any;
  }
  return payload as any;
};

// 根据 owned_by 字段判断提供商
const getProviderFromOwnedBy = (ownedBy: string): string => {
  const normalizedOwnedBy = ownedBy.toLowerCase();

  if (normalizedOwnedBy.includes('anthropic') || normalizedOwnedBy.includes('claude')) {
    return 'anthropic';
  }
  if (normalizedOwnedBy.includes('google') || normalizedOwnedBy.includes('gemini')) {
    return 'google';
  }
  if (normalizedOwnedBy.includes('xai') || normalizedOwnedBy.includes('grok')) {
    return 'xai';
  }

  // 默认为 openai
  return 'openai';
};

// 全局的模型路由映射，在 models 函数执行后被填充
let globalModelRouteMap: Map<string, string> = new Map();

export const LobeNewAPIAI = createRouterRuntime({
  debug: {
    chatCompletion: () => process.env.DEBUG_NEWAPI_CHAT_COMPLETION === '1',
  },
  defaultHeaders: {
    'X-Client': 'LobeHub',
  },
  id: ModelProvider.NewAPI,
  models: async ({ client: openAIClient }) => {
    // 每次调用 models 时清空并重建路由映射
    globalModelRouteMap.clear();

    // 获取基础 URL（移除末尾的 /v1）
    const baseURL = openAIClient.baseURL.replace(/\/v1\/?$/, '');

      const modelsPage = (await openAIClient.models.list()) as any;
      const modelList: NewAPIModelCard[] = modelsPage.data || [];

      // 尝试获取 pricing 信息以补充模型详细信息
      let pricingMap: Map<string, NewAPIPricing> = new Map();
      try {
        // 使用保存的 baseURL
        const pricingResponse = await fetch(`${baseURL}/api/pricing`, {
          headers: {
            Authorization: `Bearer ${openAIClient.apiKey}`,
          },
        });

        if (pricingResponse.ok) {
          const pricingData = await pricingResponse.json();
          if (pricingData.success && pricingData.data) {
            (pricingData.data as NewAPIPricing[]).forEach((pricing) => {
              pricingMap.set(pricing.model_name, pricing);
            });
          }
        }
      } catch (error) {
        // If fetching pricing information fails, continue using the basic model information
        console.debug('Failed to fetch NewAPI pricing info:', error);
      }

      // Process the model list: determine the provider for each model based on priority rules
      const enrichedModelList = modelList.map((model) => {
        let enhancedModel: any = { ...model };

        // 1. 添加 pricing 信息
        const pricing = pricingMap.get(model.id);
        if (pricing) {
          // NewAPI 的价格计算逻辑：
          // - quota_type: 0 表示按量计费（按 token），1 表示按次计费
          // - model_ratio: 相对于基础价格的倍率（基础价格 = $0.002/1K tokens）
          // - model_price: 直接指定的价格（优先使用）
          // - completion_ratio: 输出价格相对于输入价格的倍率
          //
          // LobeChat 需要的格式：美元/百万 token

          let inputPrice: number | undefined;
          let outputPrice: number | undefined;

          if (pricing.quota_type === 0) {
            // 按量计费
            if (pricing.model_price && pricing.model_price > 0) {
              // model_price is a direct price value; need to confirm its unit.
              // Assumption: model_price is the price per 1,000 tokens (i.e., $/1K tokens).
              // To convert to price per 1,000,000 tokens ($/1M tokens), multiply by 1,000,000 / 1,000 = 1,000.
              // Since the base price is $0.002/1K tokens, multiplying by 2 gives $2/1M tokens.
              // Therefore, inputPrice = model_price * 2 converts the price to $/1M tokens for LobeChat.
              inputPrice = pricing.model_price * 2;
            } else if (pricing.model_ratio) {
              // model_ratio × $0.002/1K = model_ratio × $2/1M
              inputPrice = pricing.model_ratio * 2; // 转换为 $/1M tokens
            }

            if (inputPrice !== undefined) {
              // 计算输出价格
              outputPrice = inputPrice * (pricing.completion_ratio || 1);

              enhancedModel.pricing = {
                input: inputPrice,
                output: outputPrice,
              };
            }
          }
          // quota_type === 1 按次计费暂不支持
        }

        // 2. 根据优先级处理 provider 信息并缓存路由
        let detectedProvider = 'openai'; // 默认

        // 优先级1：使用 supported_endpoint_types
        if (model.supported_endpoint_types && model.supported_endpoint_types.length > 0) {
          if (model.supported_endpoint_types.includes('anthropic')) {
            detectedProvider = 'anthropic';
          } else if (model.supported_endpoint_types.includes('gemini')) {
            detectedProvider = 'google';
          } else if (model.supported_endpoint_types.includes('xai')) {
            detectedProvider = 'xai';
          }
        }
        // 优先级2：使用 owned_by 字段
        else if (model.owned_by) {
          detectedProvider = getProviderFromOwnedBy(model.owned_by);
        }
        // 优先级3：基于模型名称检测
        else {
          detectedProvider = detectModelProvider(model.id);
        }

        // 将检测到的 provider 信息附加到模型上，供路由使用
        enhancedModel._detectedProvider = detectedProvider;
        // 同时更新全局路由映射表
        globalModelRouteMap.set(model.id, detectedProvider);

        return enhancedModel;
      });

      // 使用 processMultiProviderModelList 处理模型能力
      const processedModels = await processMultiProviderModelList(enrichedModelList, 'newapi');

      // 如果我们检测到了 provider，确保它被正确应用
      return processedModels.map((model: any) => {
        if (model._detectedProvider) {
          // Here you can adjust certain model properties as needed.
          // FIXME: The current data structure does not support storing provider information, and the official NewAPI does not provide a corresponding field. Consider extending the model schema if provider tracking is required in the future.
          delete model._detectedProvider; // Remove temporary field
        }
        return model;
      });
    },
    // 使用动态 routers 配置，在构造时获取用户的 baseURL
    routers: (options) => {
      // 使用全局的模型路由映射
      const userBaseURL = options.baseURL?.replace(/\/v1\/?$/, '') || '';
      
      return [
      {
        apiType: 'anthropic',
        models: () =>
          Promise.resolve(
            Array.from(globalModelRouteMap.entries())
              .filter(([, provider]) => provider === 'anthropic')
              .map(([modelId]) => modelId),
          ),
        options: {
          // Anthropic 在 NewAPI 中使用 /v1 路径，会自动转换为 /v1/messages
          baseURL: urlJoin(userBaseURL, '/v1'),
        },
      },
      {
        apiType: 'google',
        models: () =>
          Promise.resolve(
            Array.from(globalModelRouteMap.entries())
              .filter(([, provider]) => provider === 'google')
              .map(([modelId]) => modelId),
          ),
        options: {
          // Gemini 在 NewAPI 中使用 /v1beta 路径
          baseURL: urlJoin(userBaseURL, '/v1beta'),
        },
      },
      {
        apiType: 'xai',
        models: () =>
          Promise.resolve(
            Array.from(globalModelRouteMap.entries())
              .filter(([, provider]) => provider === 'xai')
              .map(([modelId]) => modelId),
          ),
        options: {
          // xAI 使用标准 OpenAI 格式，走 /v1 路径
          baseURL: urlJoin(userBaseURL, '/v1'),
        },
      },
      {
        apiType: 'openai',
        options: {
          baseURL: urlJoin(userBaseURL, '/v1'),
          chatCompletion: {
            handlePayload,
          },
        },
      },
      ];
    },
});
