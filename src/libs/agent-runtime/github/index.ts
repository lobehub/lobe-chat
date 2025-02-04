import { LOBE_DEFAULT_MODEL_LIST } from '@/config/modelProviders';
import type { ChatModelCard } from '@/types/llm';

import { AgentRuntimeErrorType } from '../error';
import { pruneReasoningPayload } from '../openai';
import { ModelProvider } from '../types';
import {
  CHAT_MODELS_BLOCK_LIST,
  LobeOpenAICompatibleFactory,
} from '../utils/openaiCompatibleFactory';

enum Task {
  'chat-completion',
  'embeddings',
}

/* eslint-disable typescript-sort-keys/interface */
type Model = {
  id: string;
  name: string;
  friendly_name: string;
  model_version: number;
  publisher: string;
  model_family: string;
  model_registry: string;
  license: string;
  task: Task;
  description: string;
  summary: string;
  tags: string[];
};
/* eslint-enable typescript-sort-keys/interface */

export const LobeGithubAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://models.inference.ai.azure.com',
  chatCompletion: {
    handlePayload: (payload) => {
      const { model } = payload;

      if (model.startsWith('o1') || model.startsWith('o3')) {
        return { ...pruneReasoningPayload(payload), stream: false } as any;
      }

      return { ...payload, stream: payload.stream ?? true };
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_GITHUB_CHAT_COMPLETION === '1',
  },
  errorType: {
    bizError: AgentRuntimeErrorType.ProviderBizError,
    invalidAPIKey: AgentRuntimeErrorType.InvalidGithubToken,
  },
  models: async ({ client }) => {
    const modelsPage = (await client.models.list()) as any;
    const modelList: Model[] = modelsPage.body;
    return modelList
      .filter((model) => {
        return CHAT_MODELS_BLOCK_LIST.every(
          (keyword) => !model.name.toLowerCase().includes(keyword),
        );
      })
      .map((model) => {
        const knownModel = LOBE_DEFAULT_MODEL_LIST.find((m) => m.id === model.name);

        if (knownModel) return knownModel;

        return {
          description: model.description,
          displayName: model.friendly_name,
          id: model.name,
        };
      })
      .filter(Boolean) as ChatModelCard[];
  },
  provider: ModelProvider.Github,
});
