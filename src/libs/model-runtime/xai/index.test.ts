// @vitest-environment node
import { ModelProvider } from '@/libs/model-runtime';
import { testProvider } from '@/libs/model-runtime/providerTestUtils';

import { LobeXAI } from './index';

testProvider({
  Runtime: LobeXAI,
  provider: ModelProvider.XAI,
  defaultBaseURL: 'https://api.x.ai/v1',
  chatDebugEnv: 'DEBUG_XAI_CHAT_COMPLETION',
  chatModel: 'grok',

  test: {
    skipAPICall: true,
  },
});
