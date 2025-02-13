import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export const LobeTencentCloudAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.lkeap.cloud.tencent.com/v1',
  debug: {
    chatCompletion: () => process.env.DEBUG_TENCENT_CLOUD_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.TencentCloud,
});
