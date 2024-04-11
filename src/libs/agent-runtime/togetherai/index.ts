import { AgentRuntimeErrorType } from '../error';
import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export const LobeTogetherAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.together.xyz/v1',
  constructorOptions: {
    defaultHeaders: {
      'HTTP-Referer': 'https://chat-preview.lobehub.com',
      'X-Title': 'Lobe Chat',
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_TOGETHERAI_CHAT_COMPLETION === '1',
  },
  errorType: {
    bizError: AgentRuntimeErrorType.TogetherAIBizError,
    invalidAPIKey: AgentRuntimeErrorType.InvalidTogetherAIAPIKey,
  },
  provider: ModelProvider.TogetherAI,
});
