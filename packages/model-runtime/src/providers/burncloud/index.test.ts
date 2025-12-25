// @vitest-environment node
import { testProvider } from '../../providerTestUtils';
import { LobeBurnCloudAI } from './index';

testProvider({
  Runtime: LobeBurnCloudAI,
  provider: 'burncloud',
  defaultBaseURL: 'https://ai.burncloud.com/v1',
  chatDebugEnv: 'DEBUG_BURNCLOUD_CHAT_COMPLETION',
  chatModel: 'gpt-4o-mini',
});
