// @vitest-environment node
import { ModelProvider } from '@/libs/agent-runtime';

import { testProvider } from '../providerTestUtils';
import { LobeHunyuanAI } from './index';

testProvider({
  Runtime: LobeHunyuanAI,
  provider: ModelProvider.Hunyuan,
  defaultBaseURL: 'https://api.hunyuan.cloud.tencent.com/v1',
  chatDebugEnv: 'DEBUG_HUNYUAN_CHAT_COMPLETION',
  chatModel: 'hunyuan-lite',
});
