import type { ChatModelCard } from '@/types/llm';

import { ModelProvider } from '../types';
import { createOpenAICompatibleRuntime } from '../utils/openaiCompatibleFactory';

export interface BurnCloudModelCard {
  id: string;
}

export const LobeBurnCloudAI = createOpenAICompatibleRuntime({
  apiKey: 'placeholder-to-avoid-error',
  baseURL: 'https://ai.burncloud.com/v1',
  debug: {
    chatCompletion: () => process.env.DEBUG_BURNCLOUD_CHAT_COMPLETION === '1',
  },
  models: async ({ client }) => {
    const { LOBE_DEFAULT_MODEL_LIST } = await import('@/config/aiModels');
    const { DEFAULT_MODEL_PROVIDER_LIST } = await import('@/config/modelProviders');

    const modelsPage = (await client.models.list()) as any;
    const modelList: BurnCloudModelCard[] = modelsPage.data;

    return modelList
      .map((model) => {
        const knownModelProvlder = DEFAULT_MODEL_PROVIDER_LIST.find(
          (mp) => mp.id.toLowerCase() === ModelProvider.BurnCloud.toLowerCase(),
        );

        const knownModel = (knownModelProvlder?.chatModels ?? LOBE_DEFAULT_MODEL_LIST).find(
          (m) => model.id.toLowerCase() === m.id.toLowerCase(),
        );

        const abilities = knownModel && 'abilities' in knownModel ? knownModel.abilities : {};
        return {
          contextWindowTokens: knownModel?.contextWindowTokens ?? undefined,
          displayName: knownModel?.displayName ?? undefined,
          enabled: knownModel?.enabled || false,
          functionCall: abilities?.functionCall || false,
          id: model.id,
          reasoning: abilities?.reasoning || false,
          vision: abilities?.vision || false,
        };
      })
      .filter(Boolean) as ChatModelCard[];
  },
  provider: ModelProvider.BurnCloud,
}); 