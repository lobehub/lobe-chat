import { isDeprecatedEdition } from '@/const/version';
import { aiModelSelectors, useAiInfraStore } from '@/store/aiInfra';
import { useUserStore } from '@/store/user';
import { modelProviderSelectors } from '@/store/user/selectors';

export const useModelSupportFiles = (model: string, provider: string) => {
  const newValue = useAiInfraStore(aiModelSelectors.isModelSupportFiles(model, provider));

  // TODO: remove this in V2.0
  const oldValue = useUserStore(modelProviderSelectors.isModelEnabledFiles(model));
  if (isDeprecatedEdition) return oldValue;
  //

  return newValue;
};
