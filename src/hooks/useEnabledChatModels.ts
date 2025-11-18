import isEqual from 'fast-deep-equal';

import { useAiInfraStore } from '@/store/aiInfra';
import { EnabledProviderWithModels } from '@/types/aiProvider';

export const useEnabledChatModels = (): EnabledProviderWithModels[] => {
  const enabledChatModelList = useAiInfraStore((s) => s.enabledChatModelList, isEqual);

  return enabledChatModelList || [];
};
