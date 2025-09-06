// @vitest-environment node
import { ModelProvider } from '@lobechat/model-runtime';

import { testProvider } from '../providerTestUtils';
import { LobeTencentCloudAI } from './index';

testProvider({
  Runtime: LobeTencentCloudAI,
  provider: ModelProvider.TencentCloud,
  defaultBaseURL: 'https://api.lkeap.cloud.tencent.com/v1',
  chatDebugEnv: 'DEBUG_TENCENT_CLOUD_CHAT_COMPLETION',
  chatModel: 'DeepSeek-R1',
});
