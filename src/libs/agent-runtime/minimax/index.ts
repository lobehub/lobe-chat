import { AgentRuntimeErrorType } from '../error';
import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export const LobeMinimaxAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.minimax.chat/v1',
  chatCompletion: {
    handlePayload: (payload) => ({
      max_tokens: payload.max_tokens,
      messages: payload.messages as any,
      model: payload.model,
      stream: true,
      temperature: payload.temperature,
      top_p: payload.top_p,
    }),
    options: {
      path: '/text/chatcompletion_v2',
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_MINIMAX_CHAT_COMPLETION === '1',
  },
  errorType: {
    bizError: AgentRuntimeErrorType.MinimaxBizError,
    invalidAPIKey: AgentRuntimeErrorType.InvalidMinimaxAPIKey,
  },
  provider: ModelProvider.Minimax,
});

export default LobeMinimaxAI;
