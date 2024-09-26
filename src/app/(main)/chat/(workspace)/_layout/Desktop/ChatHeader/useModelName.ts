import { useMemo } from 'react';

import { useUserStore } from '@/store/user';
import { modelProviderSelectors } from '@/store/user/selectors';
import { ChatModelCard } from '@/types/llm';

export const useModelName = (model: string): string => {
  const enabledList = useUserStore(modelProviderSelectors.modelProviderListForModelSelect);

  return useMemo(() => {
    const modelProvider = enabledList.find((provider) =>
      provider.chatModels.some((chatModel: ChatModelCard) => chatModel.id === model),
    );
    const modelCard = modelProvider?.chatModels.find(
      (chatModel: ChatModelCard) => chatModel.id === model,
    );
    return modelCard?.displayName || model;
  }, [enabledList, model]);
};
