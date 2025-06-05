import type { ChatModelCard } from '@/types/llm';

export interface ModelProcessorConfig {
  excludeKeywords?: readonly string[]; // 对符合的模型不添加标签
  functionCallKeywords?: readonly string[];
  reasoningKeywords?: readonly string[];
  visionKeywords?: readonly string[];
}

// 模型标签关键词配置
export const MODEL_LIST_CONFIGS = {
  anthropic: {
    functionCallKeywords: ['claude'],
    reasoningKeywords: ['-3-7', '3.7', '-4'],
    visionKeywords: ['claude'],
  },
  deepseek: {
    functionCallKeywords: ['v3', 'r1'],
    reasoningKeywords: ['r1'],
  },
  google: {
    functionCallKeywords: ['gemini'],
    reasoningKeywords: ['thinking', '-2.5-'],
    visionKeywords: ['gemini', 'learnlm'],
  },
  llama: {
    functionCallKeywords: ['llama-3.2', 'llama-3.3', 'llama-4'],
    reasoningKeywords: [],
    visionKeywords: [],
  },
  openai: {
    excludeKeywords: ['audio'],
    functionCallKeywords: ['4o', '4.1', 'o3', 'o4'],
    reasoningKeywords: ['o1', 'o3', 'o4'],
    visionKeywords: ['4o', '4.1', 'o4'],
  },
  qwen: {
    functionCallKeywords: [
      'qwen-max',
      'qwen-plus',
      'qwen-turbo',
      'qwen-long',
      'qwen1.5',
      'qwen2',
      'qwen2.5',
      'qwen3',
    ],
    reasoningKeywords: ['qvq', 'qwq', 'qwen3'],
    visionKeywords: ['qvq', 'vl'],
  },
  volcengine: {
    functionCallKeywords: ['doubao-1.5'],
    reasoningKeywords: ['thinking', '-r1'],
    visionKeywords: ['vision', '-m'],
  },
  zeroone: {
    functionCallKeywords: ['fc'],
    visionKeywords: ['vision'],
  },
  zhipu: {
    functionCallKeywords: ['glm-4', 'glm-z1'],
    reasoningKeywords: ['glm-zero', 'glm-z1'],
    visionKeywords: ['glm-4v'],
  },
} as const;

// 模型提供商关键词配置
export const PROVIDER_DETECTION_CONFIG = {
  anthropic: ['claude'],
  deepseek: ['deepseek'],
  google: ['gemini'],
  llama: ['llama'],
  openai: ['o1', 'o3', 'o4', 'gpt-'],
  qwen: ['qwen', 'qwq', 'qvq'],
  volcengine: ['doubao'],
  zeroone: ['yi-'],
  zhipu: ['glm'],
} as const;

/**
 * 检测单个模型的提供商类型
 * @param modelId 模型ID
 * @returns 检测到的提供商配置键名，默认为 'openai'
 */
export const detectModelProvider = (modelId: string): keyof typeof MODEL_LIST_CONFIGS => {
  const lowerModelId = modelId.toLowerCase();

  for (const [provider, keywords] of Object.entries(PROVIDER_DETECTION_CONFIG)) {
    const hasKeyword = keywords.some((keyword) => lowerModelId.includes(keyword));

    if (hasKeyword && provider in MODEL_LIST_CONFIGS) {
      return provider as keyof typeof MODEL_LIST_CONFIGS;
    }
  }

  return 'openai';
};

/**
 * 处理模型卡片的通用逻辑
 */
const processModelCard = (
  model: { [key: string]: any; id: string },
  config: ModelProcessorConfig,
  knownModel?: any,
): ChatModelCard => {
  const {
    functionCallKeywords = [],
    visionKeywords = [],
    reasoningKeywords = [],
    excludeKeywords = [],
  } = config;

  const isExcludedModel = excludeKeywords.some((keyword) =>
    model.id.toLowerCase().includes(keyword),
  );

  return {
    contextWindowTokens: model.contextWindowTokens ?? knownModel?.contextWindowTokens ?? undefined,
    displayName: model.displayName ?? knownModel?.displayName ?? model.id,
    enabled: knownModel?.enabled || false,
    functionCall:
      (functionCallKeywords.some((keyword) => model.id.toLowerCase().includes(keyword)) &&
        !isExcludedModel) ||
      knownModel?.abilities?.functionCall ||
      false,
    id: model.id,
    maxOutput: model.maxOutput ?? knownModel?.maxOutput ?? undefined,
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
};

/**
 * 处理单一提供商的模型列表
 * @param modelList 模型列表
 * @param config 提供商配置
 * @returns 处理后的模型卡片列表
 */
export const processModelList = async (
  modelList: Array<{ id: string }>,
  config: ModelProcessorConfig,
): Promise<ChatModelCard[]> => {
  const { LOBE_DEFAULT_MODEL_LIST } = await import('@/config/aiModels');

  return modelList
    .map((model) => {
      const knownModel = LOBE_DEFAULT_MODEL_LIST.find(
        (m) => model.id.toLowerCase() === m.id.toLowerCase(),
      );

      return processModelCard(model, config, knownModel);
    })
    .filter(Boolean);
};

/**
 * 处理混合提供商的模型列表
 * @param modelList 模型列表
 * @returns 处理后的模型卡片列表
 */
export const processMultiProviderModelList = async (
  modelList: Array<{ id: string }>,
): Promise<ChatModelCard[]> => {
  const { LOBE_DEFAULT_MODEL_LIST } = await import('@/config/aiModels');

  return modelList
    .map((model) => {
      const detectedProvider = detectModelProvider(model.id);
      const config = MODEL_LIST_CONFIGS[detectedProvider];

      const knownModel = LOBE_DEFAULT_MODEL_LIST.find(
        (m) => model.id.toLowerCase() === m.id.toLowerCase(),
      );

      return processModelCard(model, config, knownModel);
    })
    .filter(Boolean);
};
