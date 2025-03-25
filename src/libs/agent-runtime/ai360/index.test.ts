// @vitest-environment node
import { ModelProvider } from '@/libs/agent-runtime';
import { testProvider } from '@/libs/agent-runtime/providerTestUtils';

import { LobeAi360AI } from './index';

testProvider({
  Runtime: LobeAi360AI,
  provider: ModelProvider.Ai360,
  defaultBaseURL: 'https://api.360.cn/v1',
  chatDebugEnv: 'DEBUG_AI360_CHAT_COMPLETION',
  chatModel: 'deepseek-r1',
});
