// @vitest-environment node
import { ModelProvider } from 'model-bank';

import { testProvider } from '../../providerTestUtils';
import { Lobe302AI } from './index';

testProvider({
  Runtime: Lobe302AI,
  provider: ModelProvider.Ai302,
  defaultBaseURL: 'https://api.302.ai/v1',
  chatDebugEnv: 'DEBUG_AI302_CHAT_COMPLETION',
  chatModel: 'gpt-3.5-turbo',
  invalidErrorType: 'InvalidProviderAPIKey',
  bizErrorType: 'ProviderBizError',
  test: {
    skipAPICall: true,
    skipErrorHandle: true,
  },
});
