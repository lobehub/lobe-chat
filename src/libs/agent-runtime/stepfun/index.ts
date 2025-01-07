import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

import { LOBE_DEFAULT_MODEL_LIST } from '@/config/modelProviders';

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
      const model = m as unknown as StepfunModelCard;

      return {
        abilities: {
          functionCall: model.id !== 'step-1.5v-mini',
          vision: model.id.toLowerCase().includes('v'),
        },
        enabled: LOBE_DEFAULT_MODEL_LIST.find((m) => model.id.endsWith(m.id))?.enabled || false,
        id: model.id,
      };
    },
  },
  provider: ModelProvider.Stepfun,
});
