// @vitest-environment node
import { ModelProvider } from '@/libs/model-runtime';
import { testProvider } from '@/libs/model-runtime/providerTestUtils';

import { LobeLMStudioAI } from './index';

const provider = ModelProvider.LMStudio;
const defaultBaseURL = 'http://127.0.0.1:1234/v1';

testProvider({
  Runtime: LobeLMStudioAI,
  provider,
  defaultBaseURL,
  chatDebugEnv: 'DEBUG_LMSTUDIO_CHAT_COMPLETION',
  chatModel: 'deepseek-r1',
});
