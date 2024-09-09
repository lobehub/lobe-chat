import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export const LobeGithubAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://models.inference.ai.azure.com',
  debug: {
    chatCompletion: () => process.env.DEBUG_GITHUB_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.Github,
});
