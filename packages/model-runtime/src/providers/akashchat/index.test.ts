// @vitest-environment node
import { ModelProvider } from 'model-bank';

import { testProvider } from '../../providerTestUtils';
import { LobeAkashChatAI } from './index';

const provider = ModelProvider.AkashChat;
const defaultBaseURL = 'https://chatapi.akash.network/api/v1';

testProvider({
  Runtime: LobeAkashChatAI,
  provider,
  defaultBaseURL,
  chatDebugEnv: 'DEBUG_AKASH_CHAT_COMPLETION',
  chatModel: 'llama-3.1-8b-instruct',
  test: {
    skipAPICall: true,
  },
});
