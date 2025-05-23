import type { ChatModelCard } from '@/types/llm';

export interface ModelProcessorConfig {
  excludeKeywords?: readonly string[];
  functionCallKeywords: readonly string[];
  reasoningKeywords: readonly string[];
  visionKeywords: readonly string[];
}

// 模型标签关键词配置
export const MODEL_CONFIGS = {
  anthropic: {
    excludeKeywords: [],
    functionCallKeywords: ['claude'],
    reasoningKeywords: ['-3-7-', '-4-'],
    visionKeywords: ['claude'],
  },
  google: {
    excludeKeywords: [],
    functionCallKeywords: ['gemini'],
    reasoningKeywords: ['thinking', '-2.5-'],
    visionKeywords: ['gemini', 'learnlm'],
  },
  openai: {
    excludeKeywords: ['audio'],
    functionCallKeywords: ['gpt-4', 'gpt-3.5', 'o3-mini'],
    reasoningKeywords: ['o1', 'o3'],
    visionKeywords: ['gpt-4o', 'vision'],
  },
  volcengine: {
    excludeKeywords: [],
    functionCallKeywords: ['doubao-1.5'],
    reasoningKeywords: ['thinking', '-r1'],
    visionKeywords: ['vision', '-m'],
  },
  zhipu: {
    excludeKeywords: [],
    functionCallKeywords: ['glm-4'],
    reasoningKeywords: ['glm-zero', 'glm-z1'],
    visionKeywords: ['glm-4v'],
  },
} as const;

// 模型提供商关键词配置
export const PROVIDER_DETECTION_CONFIG = {
  anthropic: ['claude'],
  google: ['gemini'],
  volcengine: ['doubao'],
  zhipu: ['glm'],
} as const;

/**
 * 检测模型的提供商类型
 * @param modelList 模型列表
 * @returns 检测到的提供商配置键名，默认为 'openai'
 */
export const detectProvider = (modelList: Array<{ id: string }>): keyof typeof MODEL_CONFIGS => {
  for (const [provider, keywords] of Object.entries(PROVIDER_DETECTION_CONFIG)) {
    const hasProviderModel = modelList.some((model) =>
      keywords.some(keyword => model.id.toLowerCase().includes(keyword))
    );
    
    if (hasProviderModel && provider in MODEL_CONFIGS) {
      return provider as keyof typeof MODEL_CONFIGS;
    }
  }
  
  return 'openai'; // 默认返回 openai 配置
};

export const processModelList = async (
  modelList: Array<{ id: string }>,
  config: ModelProcessorConfig,
): Promise<ChatModelCard[]> => {
  const { LOBE_DEFAULT_MODEL_LIST } = await import('@/config/aiModels');
  const { functionCallKeywords, visionKeywords, reasoningKeywords, excludeKeywords = [] } = config;

  return modelList
    .map((model) => {
      const knownModel = LOBE_DEFAULT_MODEL_LIST.find(
        (m) => model.id.toLowerCase() === m.id.toLowerCase(),
      );

      const isExcludedModel = excludeKeywords.some((keyword) => 
        model.id.toLowerCase().includes(keyword)
      );

      return {
        contextWindowTokens: knownModel?.contextWindowTokens ?? undefined,
        displayName: knownModel?.displayName ?? undefined,
        enabled: knownModel?.enabled || false,
        functionCall:
          (functionCallKeywords.some((keyword) => model.id.toLowerCase().includes(keyword)) &&
            !isExcludedModel) ||
          knownModel?.abilities?.functionCall ||
          false,
        id: model.id,
        reasoning:
          reasoningKeywords.some((keyword) => model.id.toLowerCase().includes(keyword)) ||
          knownModel?.abilities?.reasoning ||
          false,
        vision:
          (visionKeywords.some((keyword) => model.id.toLowerCase().includes(keyword)) &&
            !isExcludedModel) ||
          knownModel?.abilities?.vision ||
          false,
      };
    })
    .filter(Boolean) as ChatModelCard[];
};