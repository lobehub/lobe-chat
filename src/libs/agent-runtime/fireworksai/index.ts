import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

import { LOBE_DEFAULT_MODEL_LIST } from '@/config/aiModels';

export interface FireworksAIModelCard {
  context_length: number;
  id: string;
  supports_image_input: boolean;
  supports_tools: boolean;
}

export const LobeFireworksAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.fireworks.ai/inference/v1',
  debug: {
    chatCompletion: () => process.env.DEBUG_FIREWORKSAI_CHAT_COMPLETION === '1',
  },
  models: {
    transformModel: (m) => {
      const reasoningKeywords = [
        'deepseek-r1',
        'qwq',
      ];

      const model = m as unknown as FireworksAIModelCard;

      return {
        contextWindowTokens: model.context_length,
        displayName: LOBE_DEFAULT_MODEL_LIST.find((m) => model.id === m.id)?.displayName ?? undefined,
        enabled: LOBE_DEFAULT_MODEL_LIST.find((m) => model.id === m.id)?.enabled || false,
        functionCall: model.supports_tools || model.id.toLowerCase().includes('function'),
        id: model.id,
        reasoning: reasoningKeywords.some(keyword => model.id.toLowerCase().includes(keyword)),
        vision: model.supports_image_input,
      };
    },
  },
  provider: ModelProvider.FireworksAI,
});
