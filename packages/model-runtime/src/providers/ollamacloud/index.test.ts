// @vitest-environment node
import { ModelProvider } from 'model-bank';

import { testProvider } from '../../providerTestUtils';
import { LobeOllamaCloudAI } from './index';

testProvider({
  Runtime: LobeOllamaCloudAI,
  provider: ModelProvider.OllamaCloud,
  defaultBaseURL: 'https://ollama.com/v1',
  chatDebugEnv: 'DEBUG_OLLAMA_CLOUD_CHAT_COMPLETION',
  chatModel: 'llama3.2',
  invalidErrorType: 'InvalidProviderAPIKey',
  bizErrorType: 'ProviderBizError',
  test: {
    skipAPICall: true,
    skipErrorHandle: true,
  },
});
