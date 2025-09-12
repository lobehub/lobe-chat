// @vitest-environment node
import { testProvider } from '../../providerTestUtils';
import { ModelProvider } from '../../types';
import { LobeVLLMAI } from './index';

testProvider({
  Runtime: LobeVLLMAI,
  provider: ModelProvider.VLLM,
  defaultBaseURL: 'http://localhost:8000/v1',
  chatDebugEnv: 'DEBUG_VLLM_CHAT_COMPLETION',
  chatModel: 'llama-2-7b-chat',
});
