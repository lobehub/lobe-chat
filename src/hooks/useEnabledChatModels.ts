import isEqual from 'fast-deep-equal';

import { isDeprecatedEdition } from '@/const/version';
import { useAiInfraStore } from '@/store/aiInfra';
import { useUserStore } from '@/store/user';
import { modelProviderSelectors } from '@/store/user/selectors';
import { EnabledProviderWithModels } from '@/types/aiProvider';

export const useEnabledChatModels = (): EnabledProviderWithModels[] => {
  const enabledList = useUserStore(modelProviderSelectors.modelProviderListForModelSelect, isEqual);
  const enabledChatModelList = useAiInfraStore((s) => s.enabledChatModelList, isEqual);

  if (isDeprecatedEdition) {
    return enabledList;
  }

  return enabledChatModelList || [];
};
