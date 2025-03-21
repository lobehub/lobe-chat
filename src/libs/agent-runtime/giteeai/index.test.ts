// @vitest-environment node
import { ModelProvider } from '@/libs/agent-runtime';
import { testProvider } from '@/libs/agent-runtime/providerTestUtils';

import { LobeGiteeAI } from './index';

testProvider({
  Runtime: LobeGiteeAI,
  provider: ModelProvider.GiteeAI,
  defaultBaseURL: 'https://ai.gitee.com/v1',
  chatDebugEnv: 'DEBUG_GITEE_AI_CHAT_COMPLETION',
  chatModel: 'deepseek-r1',
});
