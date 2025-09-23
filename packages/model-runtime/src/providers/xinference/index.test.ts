// @vitest-environment node
import { ModelProvider } from 'model-bank';

import { testProvider } from '../../providerTestUtils';
import { LobeXinferenceAI } from './index';

testProvider({
  Runtime: LobeXinferenceAI,
  provider: ModelProvider.Xinference,
  defaultBaseURL: 'http://localhost:9997/v1',
  chatDebugEnv: 'DEBUG_XINFERENCE_CHAT_COMPLETION',
  chatModel: 'llama-2-7b-chat',
});
