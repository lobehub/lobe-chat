// @vitest-environment node
import { ModelProvider } from '@lobechat/model-runtime';

import { testProvider } from '../providerTestUtils';
import { LobeModelScopeAI } from './index';

const provider = ModelProvider.ModelScope;
const defaultBaseURL = 'https://api-inference.modelscope.cn/v1';

testProvider({
  Runtime: LobeModelScopeAI,
  provider,
  defaultBaseURL,
  chatDebugEnv: 'DEBUG_MODELSCOPE_CHAT_COMPLETION',
  chatModel: 'qwen2-7b-instruct',
  test: {
    skipAPICall: true,
  },
});
