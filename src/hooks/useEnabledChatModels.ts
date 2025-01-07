import isEqual from 'fast-deep-equal';

import { useUserStore } from '@/store/user';
import { modelProviderSelectors } from '@/store/user/selectors';
import { EnabledProviderWithModels } from '@/types/aiModel';

export const useEnabledChatModels = (): EnabledProviderWithModels[] => {
  return useUserStore(modelProviderSelectors.modelProviderListForModelSelect, isEqual);
};
