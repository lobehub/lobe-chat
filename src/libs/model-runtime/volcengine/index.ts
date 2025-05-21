import type { ChatModelCard } from '@/types/llm';

import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export interface VolcengineModelCard {
  id: string;
}

export const LobeVolcengineAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
  chatCompletion: {
    handlePayload: (payload) => {
      const { model, thinking, ...rest } = payload;

      return {
        ...rest,
        model,
        ...(['thinking-vision-pro'].some((keyword) => model.toLowerCase().includes(keyword))
          ? {
              thinking:
                thinking !== undefined && thinking.type === 'enabled'
                  ? { type: 'enabled' }
                  : { type: 'disabled' },
            }
          : {}),
      } as any;
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_VOLCENGINE_CHAT_COMPLETION === '1',
  },
  models: async ({ client }) => {
    const { LOBE_DEFAULT_MODEL_LIST } = await import('@/config/aiModels');

    const functionCallKeywords = ['doubao-1.5'];

    const visionKeywords = ['vision', '-m'];

    const reasoningKeywords = ['thinking', '-r1'];

    const modelsPage = (await client.models.list()) as any;
    const modelList: VolcengineModelCard[] = modelsPage.data;

    return modelList
      .map((model) => {
        const knownModel = LOBE_DEFAULT_MODEL_LIST.find(
          (m) => model.id.toLowerCase() === m.id.toLowerCase(),
        );

        return {
          contextWindowTokens: knownModel?.contextWindowTokens ?? undefined,
          displayName: knownModel?.displayName ?? undefined,
          enabled: knownModel?.enabled || false,
          functionCall:
            functionCallKeywords.some((keyword) => model.id.toLowerCase().includes(keyword)) ||
            knownModel?.abilities?.functionCall ||
            false,
          id: model.id,
          reasoning:
            reasoningKeywords.some((keyword) => model.id.toLowerCase().includes(keyword)) ||
            knownModel?.abilities?.reasoning ||
            false,
          vision:
            visionKeywords.some((keyword) => model.id.toLowerCase().includes(keyword)) ||
            knownModel?.abilities?.vision ||
            false,
        };
      })
      .filter(Boolean) as ChatModelCard[];
  },
  provider: ModelProvider.Volcengine,
});
