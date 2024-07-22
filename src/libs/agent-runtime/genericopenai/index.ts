import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export const LobeGenericOpenAI = LobeOpenAICompatibleFactory({
  baseURL: 'http://localhost:5000/v1',
  debug: {
    chatCompletion: () => process.env.DEBUG_GENERIC_OPENAI_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.GenericOpenAI,
});
