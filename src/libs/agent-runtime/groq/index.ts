import { AgentRuntimeErrorType } from '../error';
import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

import { LOBE_DEFAULT_MODEL_LIST } from '@/config/aiModels';

export interface GroqModelCard {
  context_window: number;
  id: string;
}

export const LobeGroq = LobeOpenAICompatibleFactory({
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
  models: {
    transformModel: (m) => {
      const functionCallKeywords = [
        'tool',
        'llama-3.3',
        'llama-3.1',
        'llama3-',
        'mixtral-8x7b-32768',
        'gemma2-9b-it',
      ];

      const reasoningKeywords = [
        'deepseek-r1',
      ];

      const model = m as unknown as GroqModelCard;

      return {
        contextWindowTokens: model.context_window,
        displayName: LOBE_DEFAULT_MODEL_LIST.find((m) => model.id === m.id)?.displayName ?? undefined,
        enabled: LOBE_DEFAULT_MODEL_LIST.find((m) => model.id === m.id)?.enabled || false,
        functionCall: functionCallKeywords.some(keyword => model.id.toLowerCase().includes(keyword)),
        id: model.id,
        reasoning: reasoningKeywords.some(keyword => model.id.toLowerCase().includes(keyword)),
        vision: model.id.toLowerCase().includes('vision'),
      };
    },
  },
  provider: ModelProvider.Groq,
});
