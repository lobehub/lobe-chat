import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

import { LOBE_DEFAULT_MODEL_LIST } from '@/config/aiModels';

export interface ZeroOneModelCard {
  id: string;
}

export const LobeZeroOneAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.lingyiwanwu.com/v1',
  debug: {
    chatCompletion: () => process.env.DEBUG_ZEROONE_CHAT_COMPLETION === '1',
  },
  models: {
    transformModel: (m) => {
      const model = m as unknown as ZeroOneModelCard;

      return {
        enabled: LOBE_DEFAULT_MODEL_LIST.find((m) => model.id.endsWith(m.id))?.enabled || false,
        functionCall: model.id.toLowerCase().includes('fc'),
        id: model.id,
        vision: model.id.toLowerCase().includes('vision'),
      };
    },
  },
  provider: ModelProvider.ZeroOne,
});
