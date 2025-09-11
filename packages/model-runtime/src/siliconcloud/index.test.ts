// @vitest-environment node
import { testProvider } from '../providerTestUtils';
import { ModelProvider } from '../types';
import { LobeSiliconCloudAI } from './index';

testProvider({
  Runtime: LobeSiliconCloudAI,
  provider: ModelProvider.SiliconCloud,
  defaultBaseURL: 'https://api.siliconflow.cn/v1',
  chatDebugEnv: 'DEBUG_SILICONCLOUD_CHAT_COMPLETION',
  chatModel: 'deepseek-r1',
});
