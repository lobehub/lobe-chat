import type { ChatModelCard } from '@/types/llm';

import { ModelProvider } from '../types';
import { createOpenAICompatibleRuntime } from '../utils/openaiCompatibleFactory';

export interface XAIModelCard {
  id: string;
}

export const GrokReasoningModels = new Set(['grok-3-mini', 'grok-4']);

export const isGrokReasoningModel = (model: string) =>
  Array.from(GrokReasoningModels).some((id) => model.includes(id));

export const LobeXAI = createOpenAICompatibleRuntime({
  baseURL: 'https://api.x.ai/v1',
  chatCompletion: {
    handlePayload: (payload) => {
      const { enabledSearch, frequency_penalty, model, presence_penalty, ...rest } = payload;

      return {
        ...rest,
        frequency_penalty: isGrokReasoningModel(model) ? undefined : frequency_penalty,
        model,
        presence_penalty: isGrokReasoningModel(model) ? undefined : presence_penalty,
        stream: true,
        ...(enabledSearch && {
          search_parameters: {
            max_search_results: Math.min(
              Math.max(parseInt(process.env.XAI_MAX_SEARCH_RESULTS ?? '15', 10), 1),
              30,
            ),
            mode: 'auto',
            return_citations: true,
            sources: [
              {
                safe_search: process.env.XAI_SAFE_SEARCH === '1',
                type: 'news',
              },
              /*
              { type: 'rss' },
              */
              {
                safe_search: process.env.XAI_SAFE_SEARCH === '1',
                type: 'web',
              },
              { type: 'x' },
            ],
          },
        }),
      } as any;
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_XAI_CHAT_COMPLETION === '1',
  },
  models: async ({ client }) => {
    const { LOBE_DEFAULT_MODEL_LIST } = await import('@/config/aiModels');

    const modelsPage = (await client.models.list()) as any;
    const modelList: XAIModelCard[] = modelsPage.data;

    return modelList
      .map((model) => {
        const knownModel = LOBE_DEFAULT_MODEL_LIST.find(
          (m) => model.id.toLowerCase() === m.id.toLowerCase(),
        );

        return {
          contextWindowTokens: knownModel?.contextWindowTokens ?? undefined,
          displayName: knownModel?.displayName ?? undefined,
          enabled: knownModel?.enabled || false,
          functionCall: knownModel?.abilities?.functionCall || false,
          id: model.id,
          reasoning: knownModel?.abilities?.reasoning || false,
          vision:
            model.id.toLowerCase().includes('vision') ||
            knownModel?.abilities?.functionCall ||
            false,
        };
      })
      .filter(Boolean) as ChatModelCard[];
  },
  provider: ModelProvider.XAI,
});
