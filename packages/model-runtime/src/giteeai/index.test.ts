// @vitest-environment node
import { ModelProvider } from '@lobechat/model-runtime';

import { testProvider } from '../providerTestUtils';
import { LobeGiteeAI } from './index';

testProvider({
  Runtime: LobeGiteeAI,
  provider: ModelProvider.GiteeAI,
  defaultBaseURL: 'https://ai.gitee.com/v1',
  chatDebugEnv: 'DEBUG_GITEE_AI_CHAT_COMPLETION',
  chatModel: 'deepseek-r1',
});
