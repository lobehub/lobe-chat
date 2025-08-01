import { ModelProvider } from '../types';
import { processMultiProviderModelList } from '../utils/modelParse';
import { createOpenAICompatibleRuntime } from '../utils/openaiCompatibleFactory';
import { QwenAIStream } from '../utils/streams';
import { createQwenImage } from './createImage';

export interface QwenModelCard {
  id: string;
}

/*
  QwenLegacyModels: A set of legacy Qwen models that do not support presence_penalty.
  Currently, presence_penalty is only supported on Qwen commercial models and open-source models starting from Qwen 1.5 and later.
*/
export const QwenLegacyModels = new Set([
  'qwen-72b-chat',
  'qwen-14b-chat',
  'qwen-7b-chat',
  'qwen-1.8b-chat',
  'qwen-1.8b-longcontext-chat',
]);

export const LobeQwenAI = createOpenAICompatibleRuntime({
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  chatCompletion: {
    handlePayload: (payload) => {
      const { model, presence_penalty, temperature, thinking, top_p, enabledSearch, ...rest } =
        payload;

      return {
        ...rest,
        ...(model.includes('-thinking')
          ? {
              enable_thinking: true,
              thinking_budget:
                thinking?.budget_tokens === 0 ? 0 : thinking?.budget_tokens || undefined,
            }
          : ['qwen3', 'qwen-turbo', 'qwen-plus'].some((keyword) =>
              model.toLowerCase().includes(keyword),
            )
            ? {
                enable_thinking: thinking !== undefined ? thinking.type === 'enabled' : false,
                thinking_budget:
                  thinking?.budget_tokens === 0 ? 0 : thinking?.budget_tokens || undefined,
              }
            : {}),
        frequency_penalty: undefined,
        model,
        presence_penalty: QwenLegacyModels.has(model)
          ? undefined
          : presence_penalty !== undefined && presence_penalty >= -2 && presence_penalty <= 2
            ? presence_penalty
            : undefined,
        stream: true,
        temperature:
          temperature !== undefined && temperature >= 0 && temperature < 2
            ? temperature
            : undefined,
        ...(model.startsWith('qvq') || model.startsWith('qwen-vl')
          ? {
              top_p: top_p !== undefined && top_p > 0 && top_p <= 1 ? top_p : undefined,
            }
          : {
              top_p: top_p !== undefined && top_p > 0 && top_p < 1 ? top_p : undefined,
            }),
        ...(enabledSearch && {
          enable_search: enabledSearch,
          search_options: {
            /*
            enable_citation: true,
            enable_source: true,
            */
            search_strategy: process.env.QWEN_SEARCH_STRATEGY || 'standard', // standard or pro
          },
        }),
        ...(payload.tools && {
          parallel_tool_calls: true,
        }),
      } as any;
    },
    handleStream: QwenAIStream,
  },
  createImage: createQwenImage,
  debug: {
    chatCompletion: () => process.env.DEBUG_QWEN_CHAT_COMPLETION === '1',
  },
  models: async ({ client }) => {
    const modelsPage = (await client.models.list()) as any;
    const modelList: QwenModelCard[] = modelsPage.data;

    return processMultiProviderModelList(modelList);
  },
  provider: ModelProvider.Qwen,
});
