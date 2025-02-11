import { AgentRuntimeErrorType } from '../error';
import { pruneReasoningPayload } from '../openai';
import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

import { LOBE_DEFAULT_MODEL_LIST } from '@/config/aiModels';
import type { ChatModelCard } from '@/types/llm';

export interface GithubModelCard {
  description: string;
  friendly_name: string;
  id: string;
  name: string;
  tags: string[];
  task: string;
}

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
    const functionCallKeywords = [
      'function',
      'tool',
    ];

    const visionKeywords = [
      'vision',
    ];

    const reasoningKeywords = [
      'deepseek-r1',
      'o1',
      'o3',
    ];

    const modelsPage = (await client.models.list()) as any;
    const modelList: GithubModelCard[] = modelsPage.body;

    return modelList
      .map((model) => {
        return {
          contextWindowTokens: LOBE_DEFAULT_MODEL_LIST.find((m) => model.name === m.id)?.contextWindowTokens ?? undefined,
          description: model.description,
          displayName: model.friendly_name,
          enabled: LOBE_DEFAULT_MODEL_LIST.find((m) => model.name === m.id)?.enabled || false,
          functionCall: functionCallKeywords.some(keyword => model.description.toLowerCase().includes(keyword)),
          id: model.name,
          reasoning: reasoningKeywords.some(keyword => model.name.toLowerCase().includes(keyword)),
          vision: visionKeywords.some(keyword => model.description.toLowerCase().includes(keyword)),
        };
      })
      .filter(Boolean) as ChatModelCard[];
  },
  provider: ModelProvider.Github,
});
