import type { ChatModelCard } from '@lobechat/types';
import { ModelProvider } from 'model-bank';

import { createOpenAICompatibleRuntime } from '../../core/openaiCompatibleFactory';
import { ChatCompletionErrorPayload } from '../../types';
import { AgentRuntimeErrorType } from '../../types/error';

export interface InfiniAIModelCard {
  id: string;
}

export const LobeInfiniAI = createOpenAICompatibleRuntime({
  baseURL: 'https://cloud.infini-ai.com/maas/v1',
  chatCompletion: {
    handleError(error): Omit<ChatCompletionErrorPayload, 'provider'> | undefined {
      let errorResponse: Response | undefined;
      if (error instanceof Response) {
        errorResponse = error;
      } else if ('status' in (error as any)) {
        errorResponse = error as Response;
      }
      if (errorResponse) {
        if (errorResponse.status === 401) {
          return {
            error,
            errorType: AgentRuntimeErrorType.InvalidProviderAPIKey,
          };
        }

        if (errorResponse.status === 429) {
          return {
            error,
            errorType: AgentRuntimeErrorType.QuotaLimitReached,
          };
        }
      }
      return {
        error,
      };
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_INFINIAI_CHAT_COMPLETION === '1',
  },
  models: async ({ client }) => {
    const { LOBE_DEFAULT_MODEL_LIST } = await import('model-bank');

    const reasoningKeywords = ['deepseek-r1', 'qwq', 'qwen3'];
    const visionKeywords = ['qwen2.5-vl'];

    const modelsPage = (await client.models.list()) as any;
    const modelList: InfiniAIModelCard[] = modelsPage.data;

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
          reasoning:
            reasoningKeywords.some((keyword) => model.id.toLowerCase().includes(keyword)) ||
            knownModel?.abilities?.reasoning ||
            false,
          vision:
            visionKeywords.some((keyword) => model.id.toLowerCase().includes(keyword)) ||
            knownModel?.abilities?.vision ||
            false,
        };
      })
      .filter(Boolean) as ChatModelCard[];
  },
  provider: ModelProvider.InfiniAI,
});
