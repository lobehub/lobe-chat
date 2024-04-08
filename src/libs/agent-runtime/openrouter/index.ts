import { AgentRuntimeErrorType } from '../error';
import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export const LobeOpenRouterAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://openrouter.ai/api/v1',
  constructorOptions: {
    defaultHeaders: {
      'HTTP-Referer': 'https://chat-preview.lobehub.com',
      'X-Title': 'Lobe Chat',
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_OPENROUTER_CHAT_COMPLETION === '1',
  },
  errorType: {
    bizError: AgentRuntimeErrorType.OpenRouterBizError,
    invalidAPIKey: AgentRuntimeErrorType.InvalidOpenRouterAPIKey,
  },
  provider: ModelProvider.OpenRouter,
});
