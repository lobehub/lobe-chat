import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

import { LOBE_DEFAULT_MODEL_LIST } from '@/config/aiModels';

export interface HunyuanModelCard {
  id: string;
}

export const LobeHunyuanAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.hunyuan.cloud.tencent.com/v1',
  debug: {
    chatCompletion: () => process.env.DEBUG_HUNYUAN_CHAT_COMPLETION === '1',
  },
  models: {
    transformModel: (m) => {
      const functionCallKeywords = [
        'hunyuan-functioncall',
        'hunyuan-turbo',
        'hunyuan-pro',
      ];

      const model = m as unknown as HunyuanModelCard;

      return {
        contextWindowTokens: LOBE_DEFAULT_MODEL_LIST.find((m) => model.id === m.id)?.contextWindowTokens ?? undefined,
        displayName: LOBE_DEFAULT_MODEL_LIST.find((m) => model.id === m.id)?.displayName ?? undefined,
        enabled: LOBE_DEFAULT_MODEL_LIST.find((m) => model.id === m.id)?.enabled || false,
        functionCall: functionCallKeywords.some(keyword => model.id.toLowerCase().includes(keyword)) && !model.id.toLowerCase().includes('vision'),
        id: model.id,
        vision: model.id.toLowerCase().includes('vision'),
      };
    },
  },
  provider: ModelProvider.Hunyuan,
});
