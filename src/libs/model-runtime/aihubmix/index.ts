import urlJoin from 'url-join';

import AiHubMixModels from '@/config/aiModels/aihubmix';
import type { ChatModelCard } from '@/types/llm';

import { createRouterRuntime } from '../RouterRuntime';
import { ModelProvider } from '../types';

export interface AiHubMixModelCard {
  created: number;
  id: string;
  object: string;
  owned_by: string;
}

const baseURL = 'https://aihubmix.com';

export const LobeAiHubMixAI = createRouterRuntime({
  debug: {
    chatCompletion: () => process.env.DEBUG_AIHUBMIX_CHAT_COMPLETION === '1',
  },
  defaultHeaders: {
    'APP-Code': 'LobeHub',
  },
  id: ModelProvider.AiHubMix,
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
  routers: [
    {
      apiType: 'anthropic',
      models: async () => {
        const { LOBE_DEFAULT_MODEL_LIST } = await import('@/config/aiModels');
        return LOBE_DEFAULT_MODEL_LIST.map((m) => m.id).filter(
          (id) => id.startsWith('claude') || id.startsWith('kimi-k2'),
        );
      },
      options: { baseURL },
    },
    {
      apiType: 'google',
      models: async () => {
        const { LOBE_DEFAULT_MODEL_LIST } = await import('@/config/aiModels');
        return LOBE_DEFAULT_MODEL_LIST.map((m) => m.id).filter((id) => id.startsWith('gemini'));
      },
      options: { baseURL: urlJoin(baseURL, '/gemini') },
    },
    {
      apiType: 'openai',
      options: { baseURL: urlJoin(baseURL, '/v1') },
    },
  ],
});
