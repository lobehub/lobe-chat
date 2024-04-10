import { AgentRuntimeErrorType } from '../error';
import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export const LobeZeroOneAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.lingyiwanwu.com/v1',
  debug: {
    chatCompletion: () => process.env.DEBUG_ZEROONE_CHAT_COMPLETION === '1',
  },
  errorType: {
    bizError: AgentRuntimeErrorType.ZeroOneBizError,
    invalidAPIKey: AgentRuntimeErrorType.InvalidZeroOneAPIKey,
  },
  provider: ModelProvider.ZeroOne,
});
