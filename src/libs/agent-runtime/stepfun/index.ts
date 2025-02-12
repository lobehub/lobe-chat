import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

import { LOBE_DEFAULT_MODEL_LIST } from '@/config/aiModels';

export interface StepfunModelCard {
  id: string;
}

export const LobeStepfunAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.stepfun.com/v1',
  chatCompletion: {
    handlePayload: (payload) => {
      return {
        ...payload,
        stream: !payload.tools,
      } as any;
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_STEPFUN_CHAT_COMPLETION === '1',
  },
  models: {
    transformModel: (m) => {
      // ref: https://platform.stepfun.com/docs/llm/modeloverview
      const functionCallKeywords = [
        'step-1-',
        'step-1o-',
        'step-1v-',
        'step-2-',
      ];

      const visionKeywords = [
        'step-1o-',
        'step-1v-',
      ];

      const model = m as unknown as StepfunModelCard;

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
        vision:
          visionKeywords.some(keyword => model.id.toLowerCase().includes(keyword))
          || knownModel?.abilities?.vision
          || false,
      };
    },
  },
  provider: ModelProvider.Stepfun,
});
