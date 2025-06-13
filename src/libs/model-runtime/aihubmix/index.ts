import AiHubMixModels from '@/config/aiModels/aihubmix';
import type { ChatModelCard } from '@/types/llm';

import { ModelProvider } from '../types';
import { createOpenAICompatibleRuntime } from '../utils/openaiCompatibleFactory';

export interface AiHubMixModelCard {
  created: number;
  id: string;
  object: string;
  owned_by: string;
}

export const LobeAiHubMixAI = createOpenAICompatibleRuntime({
  baseURL: 'https://aihubmix.com/v1',
  debug: {
    chatCompletion: () => process.env.DEBUG_AIHUBMIX_CHAT_COMPLETION === '1',
  },
  models: async ({ client }) => {
    const functionCallKeywords = [
      'gpt-4',
      'gpt-3.5',
      'claude',
      'gemini',
      'qwen',
      'deepseek',
      'llama',
    ];

    const visionKeywords = [
      'gpt-4o',
      'gpt-4-vision',
      'claude-3',
      'claude-4',
      'gemini-pro-vision',
      'qwen-vl',
      'llava',
    ];

    const reasoningKeywords = [
      'o1',
      'deepseek-r1',
      'qwq',
      'claude-opus-4',
      'claude-sonnet-4',
      'claude-3-5-sonnet',
      'claude-3-5-haiku',
    ];

    try {
      const modelsPage = (await client.models.list()) as any;
      const modelList: AiHubMixModelCard[] = modelsPage.data || [];

      return modelList
        .map((model) => {
          const knownModel = AiHubMixModels.find(
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
        'Failed to fetch AiHubMix models. Please ensure your AiHubMix API key is valid:',
        error,
      );
      return [];
    }
  },
  provider: ModelProvider.AiHubMix,
});
