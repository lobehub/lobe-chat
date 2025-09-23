// @vitest-environment node
import { ModelProvider } from 'model-bank';

import { testProvider } from '../../providerTestUtils';
import { LobeCometAPIAI } from './index';

testProvider({
  Runtime: LobeCometAPIAI,
  provider: ModelProvider.CometAPI,
  defaultBaseURL: 'https://api.cometapi.com/v1',
  chatDebugEnv: 'DEBUG_COMETAPI_COMPLETION',
  chatModel: 'gpt-3.5-turbo',
});
