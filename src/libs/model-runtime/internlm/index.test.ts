// @vitest-environment node
import { ModelProvider } from '@/libs/model-runtime';
import { testProvider } from '@/libs/model-runtime/providerTestUtils';

import { LobeInternLMAI } from './index';

testProvider({
  Runtime: LobeInternLMAI,
  provider: ModelProvider.InternLM,
  defaultBaseURL: 'https://internlm-chat.intern-ai.org.cn/puyu/api/v1',
  chatDebugEnv: 'DEBUG_INTERNLM_CHAT_COMPLETION',
  chatModel: 'hunyuan-lite',
});
