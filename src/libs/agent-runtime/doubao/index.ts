import { LOBE_DEFAULT_MODEL_LIST } from '@/config/aiModels';

import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export interface DoubaoModelCard {
  context_window: number;
  id: string;
}

export const LobeDoubaoAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
  debug: {
    chatCompletion: () => process.env.DEBUG_DOUBAO_CHAT_COMPLETION === '1',
  },
  models: {
    transformModel: (m) => {
      const functionCallKeywords = ['tool'];

      const model = m as unknown as DoubaoModelCard;

      return {
        contextWindowTokens: model.context_window,
        enabled: LOBE_DEFAULT_MODEL_LIST.find((m) => model.id.endsWith(m.id))?.enabled || false,
        functionCall: functionCallKeywords.some((keyword) =>
          model.id.toLowerCase().includes(keyword),
        ),
        id: model.id,
        vision: model.id.toLowerCase().includes('vision'),
      };
    },
  },
  provider: ModelProvider.Doubao,
});
