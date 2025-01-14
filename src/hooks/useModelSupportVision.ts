import { isServerMode } from '@/const/version';
import { aiModelSelectors, useAiInfraStore } from '@/store/aiInfra';
import { useUserStore } from '@/store/user';
import { modelProviderSelectors } from '@/store/user/selectors';

export const useModelSupportVision = (model: string, provider: string) => {
  const newValue = useAiInfraStore(aiModelSelectors.isModelSupportVision(model, provider));

  // TODO: remove this in V2.0
  const oldValue = useUserStore(modelProviderSelectors.isModelEnabledVision(model));
  if (!isServerMode) return oldValue;
  //

  return newValue;
};
