// @vitest-environment node
import { ModelProvider } from 'model-bank';

import { testProvider } from '../../providerTestUtils';
import { LobeSenseNovaAI } from './index';

const provider = ModelProvider.SenseNova;
const defaultBaseURL = 'https://api.sensenova.cn/compatible-mode/v1';

testProvider({
  Runtime: LobeSenseNovaAI,
  provider,
  defaultBaseURL,
  chatDebugEnv: 'DEBUG_SENSENOVA_CHAT_COMPLETION',
  chatModel: 'deepseek-r1',
  test: {
    skipAPICall: true,
  },
});
