import type { ChatModelCard } from '@/types/llm';

import { createOpenAICompatibleRuntime } from '../../core/openaiCompatibleFactory';
import { ChatStreamPayload, ModelProvider } from '../../types';

export interface BaichuanModelCard {
  function_call: boolean;
  max_input_length: number;
  max_tokens: number;
  model: string;
  model_show_name: string;
}

export const LobeBaichuanAI = createOpenAICompatibleRuntime({
  baseURL: 'https://api.baichuan-ai.com/v1',
  chatCompletion: {
    handlePayload: (payload: ChatStreamPayload) => {
      const { enabledSearch, temperature, tools, ...rest } = payload;

      const baichuanTools = enabledSearch
        ? [
            ...(tools || []),
            {
              type: 'web_search',
              web_search: {
                enable: true,
                search_mode: process.env.BAICHUAN_SEARCH_MODE || 'performance_first', // performance_first or quality_first
              },
            },
          ]
        : tools;

      return {
        ...rest,
        // [baichuan] frequency_penalty must be between 1 and 2.
        frequency_penalty: undefined,
        temperature: temperature !== undefined ? temperature / 2 : undefined,
        tools: baichuanTools,
      } as any;
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_BAICHUAN_CHAT_COMPLETION === '1',
  },
  models: async ({ client }) => {
    const { LOBE_DEFAULT_MODEL_LIST } = await import('model-bank');

    const modelsPage = (await client.models.list()) as any;
    const modelList: BaichuanModelCard[] = modelsPage.data;

    return modelList
      .map((model) => {
        const knownModel = LOBE_DEFAULT_MODEL_LIST.find(
          (m) => model.model.toLowerCase() === m.id.toLowerCase(),
        );

        return {
          contextWindowTokens: model.max_input_length,
          displayName: model.model_show_name,
          enabled: knownModel?.enabled || false,
          functionCall: model.function_call,
          id: model.model,
          maxTokens: model.max_tokens,
          reasoning: knownModel?.abilities?.reasoning || false,
          vision: knownModel?.abilities?.vision || false,
        };
      })
      .filter(Boolean) as ChatModelCard[];
  },
  provider: ModelProvider.Baichuan,
});
