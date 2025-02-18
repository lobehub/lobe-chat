// @vitest-environment node
import { ModelProvider } from '@/libs/agent-runtime';

import { testProvider } from '../providerTestUtils';
import { LobeBaichuanAI } from './index';

testProvider({
  Runtime: LobeBaichuanAI,
  provider: ModelProvider.Baichuan,
  defaultBaseURL: 'https://api.baichuan-ai.com/v1',
  chatDebugEnv: 'DEBUG_BAICHUAN_CHAT_COMPLETION',
  chatModel: 'hunyuan-lite',
});
