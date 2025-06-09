import type { ChatModelCard } from '@/types/llm';

import { AgentRuntimeErrorType } from '../error';
import { ModelProvider } from '../types';
import { createOpenAICompatibleRuntime } from '../utils/openaiCompatibleFactory';

export interface GroqModelCard {
  context_window: number;
  id: string;
}

export const LobeGroq = createOpenAICompatibleRuntime({
  baseURL: 'https://api.groq.com/openai/v1',
  chatCompletion: {
    handleError: (error) => {
      // 403 means the location is not supported
      if (error.status === 403)
        return { error, errorType: AgentRuntimeErrorType.LocationNotSupportError };
    },
    handlePayload: (payload) => {
      const { temperature, ...restPayload } = payload;
      return {
        ...restPayload,
        // disable stream for tools due to groq dont support
        stream: !payload.tools,

        temperature: temperature <= 0 ? undefined : temperature,
      } as any;
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_GROQ_CHAT_COMPLETION === '1',
  },
  models: async ({ client }) => {
    const { LOBE_DEFAULT_MODEL_LIST } = await import('@/config/aiModels');

    const functionCallKeywords = [
      'tool',
      'llama-3.3',
      'llama-3.1',
      'llama3-',
      'mixtral-8x7b-32768',
      'gemma2-9b-it',
    ];

    const reasoningKeywords = ['deepseek-r1'];

    const modelsPage = (await client.models.list()) as any;
    const modelList: GroqModelCard[] = modelsPage.data;

    return modelList
      .map((model) => {
        const knownModel = LOBE_DEFAULT_MODEL_LIST.find(
          (m) => model.id.toLowerCase() === m.id.toLowerCase(),
        );

        return {
          contextWindowTokens: model.context_window,
          displayName: knownModel?.displayName ?? undefined,
          enabled: knownModel?.enabled || false,
          functionCall:
            functionCallKeywords.some((keyword) => model.id.toLowerCase().includes(keyword)) ||
            knownModel?.abilities?.functionCall ||
            false,
          id: model.id,
          reasoning:
            reasoningKeywords.some((keyword) => model.id.toLowerCase().includes(keyword)) ||
            knownModel?.abilities?.reasoning ||
            false,
          vision:
            model.id.toLowerCase().includes('vision') || knownModel?.abilities?.vision || false,
        };
      })
      .filter(Boolean) as ChatModelCard[];
  },
  provider: ModelProvider.Groq,
});
