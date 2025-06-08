import { ChatStreamPayload, ModelProvider } from '../types';
import { processMultiProviderModelList } from '../utils/modelParse';
import { createOpenAICompatibleRuntime } from '../utils/openaiCompatibleFactory';
import { pruneReasoningPayload } from '../utils/openaiHelpers';

export interface OpenAIModelCard {
  id: string;
}

const prunePrefixes = ['o1', 'o3', 'o4'];

export const LobeOpenAI = createOpenAICompatibleRuntime({
  baseURL: 'https://api.openai.com/v1',
  chatCompletion: {
    handlePayload: (payload) => {
      const { model } = payload;

      if (model === 'o1-pro') {
        return { ...payload, apiMode: 'responses' } as ChatStreamPayload;
      }

      if (prunePrefixes.some((prefix) => model.startsWith(prefix))) {
        return pruneReasoningPayload(payload) as any;
      }

      if (model.includes('-search-')) {
        const oaiSearchContextSize = process.env.OPENAI_SEARCH_CONTEXT_SIZE; // low, medium, high

        return {
          ...payload,
          frequency_penalty: undefined,
          presence_penalty: undefined,
          stream: payload.stream ?? true,
          temperature: undefined,
          top_p: undefined,
          ...(oaiSearchContextSize && {
            web_search_options: {
              search_context_size: oaiSearchContextSize,
            },
          }),
        } as any;
      }

      return { ...payload, stream: payload.stream ?? true };
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_OPENAI_CHAT_COMPLETION === '1',
    responses: () => process.env.DEBUG_OPENAI_RESPONSES === '1',
  },
  models: async ({ client }) => {
    const modelsPage = (await client.models.list()) as any;
    const modelList: OpenAIModelCard[] = modelsPage.data;

    // 自动检测模型提供商并选择相应配置
    return processMultiProviderModelList(modelList);
  },
  provider: ModelProvider.OpenAI,
  responses: {
    handlePayload: (payload: ChatStreamPayload) => {
      const { model } = payload;
      if (prunePrefixes.some((prefix) => model.startsWith(prefix))) {
        if (!payload.reasoning) {
          payload.reasoning = { summary: 'auto' };
        } else {
          payload.reasoning.summary = 'auto';
        }
      }

      return { ...payload, stream: payload.stream ?? true };
    },
  },
});
