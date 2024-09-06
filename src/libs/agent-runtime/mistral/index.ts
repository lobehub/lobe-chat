import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export const LobeMistralAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.mistral.ai/v1',
  chatCompletion: {
    handlePayload: (payload) => ({
      ...payload.max_tokens !== undefined && { max_tokens: payload.max_tokens },
      messages: payload.messages as any,
      model: payload.model,
      stream: true,
      temperature: payload.temperature,
      ...payload.tools && { tools: payload.tools },
      top_p: payload.top_p,
    }),
    noUserId: true,
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_MISTRAL_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.Mistral,
});
