import type { ChatModelCard } from '@/types/llm';

export interface ModelProcessorConfig {
  functionCallKeywords: readonly string[];
  visionKeywords: readonly string[];
  reasoningKeywords: readonly string[];
  excludeKeywords?: readonly string[];
}

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

// 预定义的配置
export const MODEL_CONFIGS = {
  openai: {
    functionCallKeywords: ['gpt-4', 'gpt-3.5', 'o3-mini'],
    visionKeywords: ['gpt-4o', 'vision'],
    reasoningKeywords: ['o1', 'o3'],
    excludeKeywords: ['audio'],
  },
  volcengine: {
    functionCallKeywords: ['doubao-1.5'],
    visionKeywords: ['vision', '-m'],
    reasoningKeywords: ['thinking', '-r1'],
    excludeKeywords: [],
  },
} as const;