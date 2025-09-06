// @vitest-environment node
import { ModelProvider } from '@lobechat/model-runtime';

import { testProvider } from '../providerTestUtils';
import { LobeNebiusAI } from './index';

const provider = ModelProvider.Nebius;
const defaultBaseURL = 'https://api.studio.nebius.com/v1';

testProvider({
  Runtime: LobeNebiusAI,
  provider,
  defaultBaseURL,
  chatDebugEnv: 'DEBUG_NEBIUS_CHAT_COMPLETION',
  chatModel: 'meta/llama-3.1-8b-instruct',
  test: {
    skipAPICall: true,
  },
});
