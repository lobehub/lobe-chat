import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

import type { ChatModelCard } from '@/types/llm';

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
  models: async ({ client }) => {
    const { LOBE_DEFAULT_MODEL_LIST } = await import('@/config/aiModels');

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

    const modelsPage = await client.models.list() as any;
    const modelList: StepfunModelCard[] = modelsPage.data;

    return modelList
      .map((model) => {
        const knownModel = LOBE_DEFAULT_MODEL_LIST.find((m) => model.id.toLowerCase() === m.id.toLowerCase());

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
            knownModel?.abilities?.reasoning
            || false,
          vision:
            visionKeywords.some(keyword => model.id.toLowerCase().includes(keyword))
            || knownModel?.abilities?.vision
            || false,
        };
      })
      .filter(Boolean) as ChatModelCard[];
  },
  provider: ModelProvider.Stepfun,
});
