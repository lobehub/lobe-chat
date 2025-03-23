// @vitest-environment node
import { ModelProvider } from '@/libs/agent-runtime';
import { testProvider } from '@/libs/agent-runtime/providerTestUtils';

import { LobeGithubAI } from './index';

testProvider({
  Runtime: LobeGithubAI,
  provider: ModelProvider.Github,
  defaultBaseURL: 'https://models.inference.ai.azure.com',
  chatDebugEnv: 'DEBUG_GITHUB_CHAT_COMPLETION',
  chatModel: 'gpt-4o',
  invalidErrorType: 'InvalidGithubToken',
});
