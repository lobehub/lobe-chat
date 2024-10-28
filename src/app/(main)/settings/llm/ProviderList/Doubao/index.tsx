'use client';

import { DoubaoProviderCard } from '@/config/modelProviders';
import { ModelProvider } from '@/libs/agent-runtime';
import { useUserStore } from '@/store/user';
import { modelProviderSelectors } from '@/store/user/selectors';

import { ProviderItem } from '../../type';

const providerKey = ModelProvider.Doubao;

export const useDoubaoProvider = (): ProviderItem => {

  // Get the first model card's deployment name as the check model
  const checkModel = useUserStore((s) => {
    const chatModelCards = modelProviderSelectors.getModelCardsById(providerKey)(s);

    if (chatModelCards.length > 0) {
      return chatModelCards[0].deploymentName;
    }

    return 'Doubao-lite-4k';
  });
  return {
    ...DoubaoProviderCard,
    checkModel,
  };
};
