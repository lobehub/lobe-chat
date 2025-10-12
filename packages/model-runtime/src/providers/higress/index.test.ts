// @vitest-environment node
import { ModelProvider } from 'model-bank';

import { testProvider } from '../../providerTestUtils';
import { LobeHigressAI } from './index';

testProvider({
  Runtime: LobeHigressAI,
  provider: ModelProvider.Higress,
  defaultBaseURL: 'https://api.openai.com/v1',
  chatDebugEnv: 'DEBUG_HIGRESS_CHAT_COMPLETION',
  chatModel: 'gpt-3.5-turbo',
  invalidErrorType: 'InvalidProviderAPIKey',
  bizErrorType: 'ProviderBizError',
  test: {
    skipAPICall: true,
    skipErrorHandle: true,
  },
});
