import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

import { LOBE_DEFAULT_MODEL_LIST } from '@/config/aiModels';

export interface TencentCloudModelCard {
  id: string;
}

export const LobeTencentCloudAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.lkeap.cloud.tencent.com/v1',
  debug: {
    chatCompletion: () => process.env.DEBUG_TENCENT_CLOUD_CHAT_COMPLETION === '1',
  },
  models: {
    transformModel: (m) => {
      const functionCallKeywords = [
        'deepseek-v3',
      ];

      const reasoningKeywords = [
        'deepseek-r1',
      ];

      const model = m as unknown as TencentCloudModelCard;

      const knownModel = LOBE_DEFAULT_MODEL_LIST.find((m) => model.id === m.id);

      return {
        contextWindowTokens: knownModel?.contextWindowTokens ?? undefined,
        displayName: knownModel?.displayName ?? undefined,
        enabled: knownModel?.enabled || false,
        functionCall:
          functionCallKeywords.some(keyword => model.id.toLowerCase().includes(keyword))
          || knownModel?.abilities?.functionCall
          || false,
        id: model.id,
        reasoning:
          reasoningKeywords.some(keyword => model.id.toLowerCase().includes(keyword))
          || knownModel?.abilities?.reasoning
          || false,
      };
    },
  },
  provider: ModelProvider.TencentCloud,
});
