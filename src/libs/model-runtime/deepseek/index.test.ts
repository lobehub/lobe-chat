// @vitest-environment node
import { ModelProvider } from '@/libs/model-runtime';
import { testProvider } from '@/libs/model-runtime/providerTestUtils';

import { LobeDeepSeekAI } from './index';

const provider = ModelProvider.DeepSeek;
const defaultBaseURL = 'https://api.deepseek.com/v1';

testProvider({
  Runtime: LobeDeepSeekAI,
  provider,
  defaultBaseURL,
  chatDebugEnv: 'DEBUG_DEEPSEEK_CHAT_COMPLETION',
  chatModel: 'deepseek-r1',
  test: {
    skipAPICall: true,
  },
});
