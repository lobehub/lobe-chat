import { AgentRuntimeErrorType } from '../error';
import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export const LobeGroq = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.groq.com/openai/v1',
  chatCompletion: {
    handleError: (error) => {
      // 403 means the location is not supporteds
      if (error.status === 403)
        return { error, errorType: AgentRuntimeErrorType.LocationNotSupportError };
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_GROQ_CHAT_COMPLETION === '1',
  },
  errorType: {
    bizError: AgentRuntimeErrorType.GroqBizError,
    invalidAPIKey: AgentRuntimeErrorType.InvalidGroqAPIKey,
  },
  provider: ModelProvider.Groq,
});
