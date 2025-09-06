// @vitest-environment node
import { testProvider } from '../providerTestUtils';
import { LobeZeroOneAI } from './index';

testProvider({
  Runtime: LobeZeroOneAI,
  provider: 'zeroone',
  defaultBaseURL: 'https://api.lingyiwanwu.com/v1',
  chatDebugEnv: 'DEBUG_ZEROONE_CHAT_COMPLETION',
  chatModel: 'yi-34b-chat-0205',
});
