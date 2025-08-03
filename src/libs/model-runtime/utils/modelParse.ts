import type { ChatModelCard } from '@/types/llm';

export interface ModelProcessorConfig {
  excludeKeywords?: readonly string[]; // 对符合的模型不添加标签
  functionCallKeywords?: readonly string[];
  reasoningKeywords?: readonly string[];
  visionKeywords?: readonly string[];
}

// 模型能力标签关键词配置
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
  grok: {
    functionCallKeywords: ['grok'],
    reasoningKeywords: ['mini', 'grok-4'],
    visionKeywords: ['vision', 'grok-4'],
  },
  llama: {
    functionCallKeywords: ['llama-3.2', 'llama-3.3', 'llama-4'],
    reasoningKeywords: [],
    visionKeywords: ['llava'],
  },
  moonshot: {
    functionCallKeywords: ['moonshot', 'kimi'],
    reasoningKeywords: ['thinking'],
    visionKeywords: ['vision', 'kimi-latest', 'kimi-thinking-preview'],
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
    reasoningKeywords: ['qvq', 'qwq', 'qwen3', '!-instruct-', '!-coder-'],
    visionKeywords: ['qvq', 'vl'],
  },
  v0: {
    functionCallKeywords: ['v0'],
    reasoningKeywords: ['v0-1.5'],
    visionKeywords: ['v0'],
  },
  volcengine: {
    functionCallKeywords: ['1.5', '1-5', '1.6', '1-6'],
    reasoningKeywords: ['thinking', 'seed', 'ui-tars'],
    visionKeywords: ['vision', '-m', 'seed', 'ui-tars'],
  },
  zeroone: {
    functionCallKeywords: ['fc'],
    visionKeywords: ['vision'],
  },
  zhipu: {
    functionCallKeywords: ['glm-4', 'glm-z1'],
    reasoningKeywords: ['glm-zero', 'glm-z1', 'glm-4.5'],
    visionKeywords: ['glm-4v', 'glm-4.1v'],
  },
} as const;

// 模型提供商关键词配置
export const PROVIDER_DETECTION_CONFIG = {
  anthropic: ['claude'],
  deepseek: ['deepseek'],
  google: ['gemini'],
  grok: ['grok'],
  llama: ['llama', 'llava'],
  moonshot: ['moonshot', 'kimi'],
  openai: ['o1', 'o3', 'o4', 'gpt-'],
  qwen: ['qwen', 'qwq', 'qvq'],
  v0: ['v0'],
  volcengine: ['doubao'],
  zeroone: ['yi-'],
  zhipu: ['glm'],
} as const;

/**
 * 检测关键词列表是否匹配模型ID（支持多种匹配模式）
 * @param modelId 模型ID（小写）
 * @param keywords 关键词列表，支持以下前缀：
 *   - ^ 开头：只在模型ID开头匹配
 *   - ! 开头：排除匹配，优先级最高
 *   - 无前缀：包含匹配（默认行为）
 * @returns 是否匹配（排除逻辑优先）
 */
const isKeywordListMatch = (modelId: string, keywords: readonly string[]): boolean => {
  // 先检查排除规则（感叹号开头）
  const excludeKeywords = keywords.filter(keyword => keyword.startsWith('!'));
  const includeKeywords = keywords.filter(keyword => !keyword.startsWith('!'));
  
  // 如果匹配任何排除规则，直接返回 false
  for (const excludeKeyword of excludeKeywords) {
    const keywordWithoutPrefix = excludeKeyword.slice(1);
    const isMatch = keywordWithoutPrefix.startsWith('^')
      ? modelId.startsWith(keywordWithoutPrefix.slice(1))
      : modelId.includes(keywordWithoutPrefix);
    
    if (isMatch) {
      return false;
    }
  }
  
  // 检查包含规则
  return includeKeywords.some(keyword => {
    if (keyword.startsWith('^')) {
      // ^ 开头则只在开头匹配
      const keywordWithoutPrefix = keyword.slice(1);
      return modelId.startsWith(keywordWithoutPrefix);
    }
    // 默认行为：包含匹配
    return modelId.includes(keyword);
  });
};

/**
 * 检测单个模型的提供商类型
 * @param modelId 模型ID
 * @returns 检测到的提供商配置键名，默认为 'openai'
 */
export const detectModelProvider = (modelId: string): keyof typeof MODEL_LIST_CONFIGS => {
  const lowerModelId = modelId.toLowerCase();

  for (const [provider, keywords] of Object.entries(PROVIDER_DETECTION_CONFIG)) {
    const hasKeyword = isKeywordListMatch(lowerModelId, keywords);

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

  const isExcludedModel = isKeywordListMatch(model.id.toLowerCase(), excludeKeywords);

  return {
    contextWindowTokens: model.contextWindowTokens ?? knownModel?.contextWindowTokens ?? undefined,
    displayName: model.displayName ?? knownModel?.displayName ?? model.id,
    enabled: knownModel?.enabled || false,
    functionCall:
      (isKeywordListMatch(model.id.toLowerCase(), functionCallKeywords) &&
        !isExcludedModel) ||
      knownModel?.abilities?.functionCall ||
      false,
    id: model.id,
    maxOutput: model.maxOutput ?? knownModel?.maxOutput ?? undefined,
    reasoning:
      isKeywordListMatch(model.id.toLowerCase(), reasoningKeywords) ||
      knownModel?.abilities?.reasoning ||
      false,
    type: model.type || knownModel?.type || 'chat',
    vision:
      (isKeywordListMatch(model.id.toLowerCase(), visionKeywords) &&
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
