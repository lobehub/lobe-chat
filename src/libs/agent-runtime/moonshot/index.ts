import { AgentRuntimeErrorType } from '../error';
import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export const LobeMoonshotAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.moonshot.cn/v1',
  debug: {
    chatCompletion: () => process.env.DEBUG_MOONSHOT_CHAT_COMPLETION === '1',
  },
  errorType: {
    bizError: AgentRuntimeErrorType.MoonshotBizError,
    invalidAPIKey: AgentRuntimeErrorType.InvalidMoonshotAPIKey,
  },
  provider: ModelProvider.Moonshot,
});
