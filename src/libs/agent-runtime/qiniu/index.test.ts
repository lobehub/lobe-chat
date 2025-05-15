// @vitest-environment node
import { ModelProvider } from '@/libs/agent-runtime';
import { testProvider } from '@/libs/agent-runtime/providerTestUtils';

import { LobeQiniuAI } from './index';

const provider = ModelProvider.Qiniu;
const defaultBaseURL = 'https://api.qnaigc.com/v1';

testProvider({
  Runtime: LobeQiniuAI,
  provider,
  defaultBaseURL,
  chatDebugEnv: 'DEBUG_QINIU_CHAT_COMPLETION',
  chatModel: 'deepseek-r1',
});
