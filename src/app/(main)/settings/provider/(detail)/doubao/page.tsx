'use client';

import { DoubaoProviderCard } from '@/config/modelProviders';
import { ModelProvider } from '@/libs/agent-runtime';
import { useUserStore } from '@/store/user';
import { modelProviderSelectors } from '@/store/user/selectors';

import { ProviderItem } from '../../type';
import ProviderDetail from '../[id]';

const providerKey = ModelProvider.Doubao;

const useProviderCard = (): ProviderItem => {
  // Get the first model card's deployment name as the check model
  const checkModel = useUserStore((s) => {
    const chatModelCards = modelProviderSelectors.getModelCardsById(providerKey)(s);
    console.log(chatModelCards);
    if (chatModelCards.length > 0) {
      return chatModelCards[0].id.split('->')[1];
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

const Page = () => {
  const card = useProviderCard();

  return <ProviderDetail {...card} />;
};

export default Page;
