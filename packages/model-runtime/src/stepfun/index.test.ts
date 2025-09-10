// @vitest-environment node
import { ModelProvider } from '@lobechat/model-runtime';

import { testProvider } from '../providerTestUtils';
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
