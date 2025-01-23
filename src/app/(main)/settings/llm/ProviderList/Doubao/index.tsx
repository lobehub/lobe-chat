'use client';

import { DoubaoProviderCard } from '@/config/modelProviders';
import { useUserStore } from '@/store/user';
import { modelProviderSelectors } from '@/store/user/selectors';
import { GlobalLLMProviderKey } from '@/types/user/settings';

import { ProviderItem } from '../../type';

const providerKey: GlobalLLMProviderKey = 'doubao';

export const useDoubaoProvider = (): ProviderItem => {
  // Get the first model card's deployment name as the check model
  const checkModel = useUserStore((s) => {
    const chatModelCards = modelProviderSelectors.getModelCardsById(providerKey)(s);

    if (chatModelCards.length > 0) {
      return chatModelCards[0].deploymentName;
    }

    return 'no-model';
  });

  return {
    ...DoubaoProviderCard,
    checkModel,
    modelList: {
      azureDeployName: true,
    },
  };
};
