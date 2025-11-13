import { ModelProvider } from 'model-bank';

import { createOpenAICompatibleRuntime } from '../../core/openaiCompatibleFactory';

export const LobeBurnCloudAI = createOpenAICompatibleRuntime({
  baseURL: 'https://ai.burncloud.com/v1',
  debug: {
    chatCompletion: () => process.env.DEBUG_BURNCLOUD_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.BurnCloud,
});
