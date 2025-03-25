// @vitest-environment node
import { ModelProvider } from '@/libs/agent-runtime';
import { testProvider } from '@/libs/agent-runtime/providerTestUtils';

import { LobeStepfunAI } from './index';

const provider = ModelProvider.Stepfun;
const defaultBaseURL = 'https://api.stepfun.com/v1';

testProvider({
  Runtime: LobeStepfunAI,
  provider,
  defaultBaseURL,
  chatDebugEnv: 'DEBUG_STEPFUN_CHAT_COMPLETION',
  chatModel: 'stepfun',
});
