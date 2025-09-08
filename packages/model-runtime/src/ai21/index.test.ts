// @vitest-environment node
import { ModelProvider } from '@lobechat/model-runtime';

import { testProvider } from '../providerTestUtils';
import { LobeAi21AI } from './index';

testProvider({
  Runtime: LobeAi21AI,
  provider: ModelProvider.Ai21,
  defaultBaseURL: 'https://api.ai21.com/studio/v1',
  chatDebugEnv: 'DEBUG_AI21_CHAT_COMPLETION',
  chatModel: 'deepseek-r1',
});
