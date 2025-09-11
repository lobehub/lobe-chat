// @vitest-environment node
import { testProvider } from '../providerTestUtils';
import { ModelProvider } from '../types';
import { LobeHigressAI } from './index';

testProvider({
  Runtime: LobeHigressAI,
  provider: ModelProvider.Higress,
  defaultBaseURL: 'https://api.openai.com/v1',
  chatDebugEnv: 'DEBUG_HIGRESS_CHAT_COMPLETION',
  chatModel: 'gpt-3.5-turbo',
});
