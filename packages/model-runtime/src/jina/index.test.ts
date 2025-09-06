// @vitest-environment node
import { ModelProvider } from '@lobechat/model-runtime';

import { testProvider } from '../providerTestUtils';
import { LobeJinaAI } from './index';

const provider = ModelProvider.Jina;
const defaultBaseURL = 'https://deepsearch.jina.ai/v1';

testProvider({
  Runtime: LobeJinaAI,
  provider,
  defaultBaseURL,
  chatDebugEnv: 'DEBUG_JINA_CHAT_COMPLETION',
  chatModel: 'jina-embeddings-v3',
  test: {
    skipAPICall: true,
  },
});
