// @vitest-environment node
import { testProvider } from '../providerTestUtils';
import { LobeMoonshotAI } from './index';

const provider = 'moonshot';
const defaultBaseURL = 'https://api.moonshot.cn/v1';

testProvider({
  Runtime: LobeMoonshotAI,
  provider,
  defaultBaseURL,
  chatDebugEnv: 'DEBUG_MOONSHOT_CHAT_COMPLETION',
  chatModel: 'moonshot-v1',
  test: {
    skipAPICall: true,
  },
});
