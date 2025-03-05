// @vitest-environment node
import { testProvider } from '@/libs/agent-runtime/providerTestUtils';

import { LobeMistralAI } from './index';

testProvider({
  provider: 'mistral',
  defaultBaseURL: 'https://api.mistral.ai/v1',
  chatModel: 'open-mistral-7b',
  Runtime: LobeMistralAI,
  chatDebugEnv: 'DEBUG_MISTRAL_CHAT_COMPLETION',
});
