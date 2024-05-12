import { AgentRuntimeErrorType } from '../error';
import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export const LobeDeepSeekAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.deepseek.com/v1',
  chatCompletion: {
    handlePayload: (payload) => ({
      max_tokens: payload.max_tokens,
      messages: payload.messages as any,
      model: payload.model,
      stream: true,
      temperature: payload.temperature,
    }),
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_DEEPSEEK_CHAT_COMPLETION === '1',
  },
  errorType: {
    bizError: AgentRuntimeErrorType.DeepSeekBizError,
    invalidAPIKey: AgentRuntimeErrorType.InvalidDeepSeekAPIKey,
  },
  provider: ModelProvider.DeepSeek,
});
