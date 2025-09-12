// @vitest-environment node
import { ModelProvider } from '@lobechat/model-runtime';

import { testProvider } from '../../providerTestUtils';
import { LobeQwenAI } from './index';

const provider = ModelProvider.Qwen;
const defaultBaseURL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';

testProvider({
  Runtime: LobeQwenAI,
  provider,
  defaultBaseURL,
  chatDebugEnv: 'DEBUG_QWEN_CHAT_COMPLETION',
  chatModel: 'qwen-2.5',
  test: {
    skipAPICall: true,
  },
});
