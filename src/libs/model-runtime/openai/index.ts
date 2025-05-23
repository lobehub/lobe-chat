import type { ChatModelCard } from '@/types/llm';

import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';
import { pruneReasoningPayload } from '../utils/openaiHelpers';
import { processModelList, MODEL_CONFIGS } from '../utils/modelParse';

export interface OpenAIModelCard {
  id: string;
}

const prunePrefixes = ['o1', 'o3', 'o4'];

export const LobeOpenAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.openai.com/v1',
  chatCompletion: {
    handlePayload: (payload) => {
      const { model } = payload;

      if (prunePrefixes.some(prefix => model.startsWith(prefix))) {
        return pruneReasoningPayload(payload) as any;
      }

      if (model.includes('-search-')) {
        return {
          ...payload,
          frequency_penalty: undefined,
          presence_penalty: undefined,
          stream: payload.stream ?? true,
          temperature: undefined,
          top_p: undefined,
        };
      }

      return { ...payload, stream: payload.stream ?? true };
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_OPENAI_CHAT_COMPLETION === '1',
  },
  models: async ({ client }) => {
    const modelsPage = (await client.models.list()) as any;
    const modelList: OpenAIModelCard[] = modelsPage.data;

    // 检查是否有 doubao 模型来决定使用哪种配置
    const hasDoubaoModel = modelList.some((model) => 
      model.id.toLowerCase().includes('doubao')
    );

    const config = hasDoubaoModel ? MODEL_CONFIGS.volcengine : MODEL_CONFIGS.openai;
    
    return processModelList(modelList, config);
  },
  provider: ModelProvider.OpenAI,
});
