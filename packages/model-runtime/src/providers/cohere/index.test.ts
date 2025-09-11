// @vitest-environment node
import { ModelProvider } from '@lobechat/model-runtime';

import { testProvider } from '../../providerTestUtils';
import { LobeCohereAI } from './index';

const provider = ModelProvider.Cohere;
const defaultBaseURL = 'https://api.cohere.ai/compatibility/v1';

testProvider({
  Runtime: LobeCohereAI,
  provider,
  defaultBaseURL,
  chatDebugEnv: 'DEBUG_COHERE_CHAT_COMPLETION',
  chatModel: 'command-r7b',
  test: {
    skipAPICall: true,
  },
});
