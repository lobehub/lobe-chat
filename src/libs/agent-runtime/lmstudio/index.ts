import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

import { LOBE_DEFAULT_MODEL_LIST } from '@/config/aiModels';

export interface LMStudioModelCard {
  id: string;
}

export const LobeLMStudioAI = LobeOpenAICompatibleFactory({
  apiKey: 'placeholder-to-avoid-error',
  baseURL: 'http://127.0.0.1:1234/v1',
  debug: {
    chatCompletion: () => process.env.DEBUG_LMSTUDIO_CHAT_COMPLETION === '1',
  },
  models: {
    transformModel: (m) => {
      const model = m as unknown as LMStudioModelCard;

      const knownModel = LOBE_DEFAULT_MODEL_LIST.find((m) => model.id === m.id);

      return {
        contextWindowTokens: knownModel?.contextWindowTokens ?? undefined,
        displayName: knownModel?.displayName ?? undefined,
        enabled: knownModel?.enabled || false,
        functionCall:
          knownModel?.abilities?.functionCall
          || false,
        id: model.id,
        reasoning:
          knownModel?.abilities?.reasoning
          || false,
        vision:
          knownModel?.abilities?.vision
          || false,
      };
    },
  },
  provider: ModelProvider.LMStudio,
});
