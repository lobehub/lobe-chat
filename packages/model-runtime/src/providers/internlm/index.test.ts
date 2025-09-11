// @vitest-environment node
import { ModelProvider } from '@lobechat/model-runtime';

import { testProvider } from '../../providerTestUtils';
import { LobeInternLMAI } from './index';

testProvider({
  Runtime: LobeInternLMAI,
  provider: ModelProvider.InternLM,
  defaultBaseURL: 'https://internlm-chat.intern-ai.org.cn/puyu/api/v1',
  chatDebugEnv: 'DEBUG_INTERNLM_CHAT_COMPLETION',
  chatModel: 'hunyuan-lite',
});
