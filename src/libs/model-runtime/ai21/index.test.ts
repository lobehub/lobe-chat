// @vitest-environment node
import { ModelProvider } from '@/libs/model-runtime';
import { testProvider } from '@/libs/model-runtime/providerTestUtils';

import { LobeAi21AI } from './index';

testProvider({
  Runtime: LobeAi21AI,
  provider: ModelProvider.Ai21,
  defaultBaseURL: 'https://api.ai21.com/studio/v1',
  chatDebugEnv: 'DEBUG_AI21_CHAT_COMPLETION',
  chatModel: 'deepseek-r1',
});
