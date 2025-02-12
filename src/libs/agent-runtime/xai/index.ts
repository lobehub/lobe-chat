import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

import { LOBE_DEFAULT_MODEL_LIST } from '@/config/aiModels';

export interface XAIModelCard {
  id: string;
}

export const LobeXAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.x.ai/v1',
  debug: {
    chatCompletion: () => process.env.DEBUG_XAI_CHAT_COMPLETION === '1',
  },
  models: {
    transformModel: (m) => {
      const model = m as unknown as XAIModelCard;

      const knownModel = LOBE_DEFAULT_MODEL_LIST.find((m) => model.id === m.id);

      return {
        contextWindowTokens: knownModel?.contextWindowTokens ?? undefined,
        displayName: knownModel?.displayName ?? undefined,
        enabled: knownModel?.enabled || false,
        functionCall:
          knownModel?.abilities?.functionCall
          || false,
        id: model.id,
        vision:
          model.id.toLowerCase().includes('vision')
          || knownModel?.abilities?.functionCall
          || false,
      };
    },
  },
  provider: ModelProvider.XAI,
});
