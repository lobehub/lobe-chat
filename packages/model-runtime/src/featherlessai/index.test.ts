// @vitest-environment node
import { ModelProvider } from '@/libs/model-runtime';
import { testProvider } from '@/libs/model-runtime/providerTestUtils';

import { LobeFeatherlessAI } from './index';

const provider = ModelProvider.FeatherlessAI;
const defaultBaseURL = 'https://api.featherless.ai/v1';

testProvider({
  Runtime: LobeFeatherlessAI,
  provider,
  defaultBaseURL,
  chatDebugEnv: 'DEBUG_FEATHERLESSAI_CHAT_COMPLETION',
  chatModel: 'deepseek-r1',
});
