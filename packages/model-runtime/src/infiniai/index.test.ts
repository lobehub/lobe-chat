// @vitest-environment node
import { testProvider } from '../providerTestUtils';
import { ModelProvider } from '../types';
import { LobeInfiniAI } from './index';

testProvider({
  Runtime: LobeInfiniAI,
  provider: ModelProvider.InfiniAI,
  defaultBaseURL: 'https://cloud.infini-ai.com/maas/v1',
  chatDebugEnv: 'DEBUG_INFINIAI_CHAT_COMPLETION',
  chatModel: 'deepseek-r1',
});
