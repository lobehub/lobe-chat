// @vitest-environment node
import { testProvider } from '../../providerTestUtils';
import { ModelProvider } from '../../types';
import { LobeCometAPIAI } from './index';

testProvider({
  Runtime: LobeCometAPIAI,
  provider: ModelProvider.CometAPI,
  defaultBaseURL: 'https://api.cometapi.com/v1',
  chatDebugEnv: 'DEBUG_COMETAPI_COMPLETION',
  chatModel: 'gpt-3.5-turbo',
});
