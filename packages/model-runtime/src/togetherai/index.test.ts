// @vitest-environment node
import { testProvider } from '../providerTestUtils';
import { LobeTogetherAI } from './index';

testProvider({
  provider: 'togetherai',
  defaultBaseURL: 'https://api.together.xyz/v1',
  chatModel: 'mistralai/mistral-7b-instruct:free',
  Runtime: LobeTogetherAI,
  chatDebugEnv: 'DEBUG_TOGETHERAI_CHAT_COMPLETION',
});
