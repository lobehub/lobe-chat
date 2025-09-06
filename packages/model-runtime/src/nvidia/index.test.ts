// @vitest-environment node
import { ModelProvider } from '@lobechat/model-runtime';

import { testProvider } from '../providerTestUtils';
import { LobeNvidiaAI } from './index';

const provider = ModelProvider.Nvidia;
const defaultBaseURL = 'https://integrate.api.nvidia.com/v1';

testProvider({
  Runtime: LobeNvidiaAI,
  provider,
  defaultBaseURL,
  chatDebugEnv: 'DEBUG_NVIDIA_CHAT_COMPLETION',
  chatModel: 'meta/llama-3.1-8b-instruct',
  test: {
    skipAPICall: true,
  },
});
