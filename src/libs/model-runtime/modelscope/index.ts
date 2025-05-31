
import type { ChatModelCard } from '@/types/llm';

import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export interface ModelScopeModelCard {
  created: number;
  id: string;
  object: string;
  owned_by: string;
}

export const LobeModelScopeAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api-inference.modelscope.cn/v1',
  debug: {
    chatCompletion: () => process.env.DEBUG_MODELSCOPE_CHAT_COMPLETION === '1',
  },
  models: async ({ client }) => {
    const { LOBE_DEFAULT_MODEL_LIST } = await import('@/config/aiModels');

    const functionCallKeywords = ['qwen', 'deepseek', 'llama'];

    const visionKeywords = ['qwen-vl', 'qwen2-vl', 'llava'];

    const reasoningKeywords = ['qwq', 'deepseek-r1'];

    try {
      const modelsPage = (await client.models.list()) as any;
      const modelList: ModelScopeModelCard[] = modelsPage.data || [];

      return modelList
        .map((model) => {
          const knownModel = LOBE_DEFAULT_MODEL_LIST.find(
            (m) => model.id.toLowerCase() === m.id.toLowerCase(),
          );

          const modelId = model.id.toLowerCase();

          return {
            contextWindowTokens: knownModel?.contextWindowTokens ?? undefined,
            displayName: knownModel?.displayName ?? model.id,
            enabled: knownModel?.enabled || false,
            functionCall:
              functionCallKeywords.some((keyword) => modelId.includes(keyword)) ||
              knownModel?.abilities?.functionCall ||
              false,
            id: model.id,
            reasoning:
              reasoningKeywords.some((keyword) => modelId.includes(keyword)) ||
              knownModel?.abilities?.reasoning ||
              false,
            vision:
              visionKeywords.some((keyword) => modelId.includes(keyword)) ||
              knownModel?.abilities?.vision ||
              false,
          };
        })
        .filter(Boolean) as ChatModelCard[];
    } catch (error) {
      console.warn(
        'Failed to fetch ModelScope models. Please ensure your ModelScope API key is valid and your Alibaba Cloud account is properly bound:',
        error,
      );
      return [];
    }
  },
  provider: ModelProvider.ModelScope,
});
