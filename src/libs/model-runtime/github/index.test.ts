// @vitest-environment node
import { ModelProvider } from '@/libs/model-runtime';
import { testProvider } from '@/libs/model-runtime/providerTestUtils';

import { LobeGithubAI } from './index';

testProvider({
  Runtime: LobeGithubAI,
  provider: ModelProvider.Github,
  defaultBaseURL: 'https://models.github.ai/inference',
  chatDebugEnv: 'DEBUG_GITHUB_CHAT_COMPLETION',
  chatModel: 'openai/gpt-4o',
  invalidErrorType: 'InvalidGithubToken',
});
