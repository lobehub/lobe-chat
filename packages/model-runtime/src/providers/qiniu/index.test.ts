// @vitest-environment node
import { testProvider } from '../../providerTestUtils';
import { ModelProvider } from '../../types';
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
