// @vitest-environment node
import { ModelProvider } from 'model-bank';

import { testProvider } from '../../providerTestUtils';
import { LobeV0AI } from './index';

testProvider({
  Runtime: LobeV0AI,
  provider: ModelProvider.V0,
  defaultBaseURL: 'https://api.v0.dev/v1',
  chatDebugEnv: 'DEBUG_V0_CHAT_COMPLETION',
  chatModel: 'gpt-4o',
  invalidErrorType: 'InvalidProviderAPIKey',
  bizErrorType: 'ProviderBizError',
  test: {
    skipAPICall: true,
    skipErrorHandle: true,
  },
});
