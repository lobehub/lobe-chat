// @vitest-environment node
import { testProvider } from '../providerTestUtils';
import { ModelProvider } from '../types';
import { LobeAiHubMixAI } from './index';

testProvider({
  Runtime: LobeAiHubMixAI,
  provider: ModelProvider.AiHubMix,
  defaultBaseURL: 'https://aihubmix.com/v1',
  chatDebugEnv: 'DEBUG_AIHUBMIX_CHAT_COMPLETION',
  chatModel: 'gpt-3.5-turbo',
});
