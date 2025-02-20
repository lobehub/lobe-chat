import { isDeprecatedEdition } from '@/const/version';
import { aiModelSelectors, useAiInfraStore } from '@/store/aiInfra';
import { useUserStore } from '@/store/user';
import { modelProviderSelectors } from '@/store/user/selectors';

export const useModelSupportReasoning = (model: string, provider: string) => {
  const newValue = useAiInfraStore(aiModelSelectors.isModelSupportReasoning(model, provider));

  // TODO: remove this in V2.0
  const oldValue = useUserStore(modelProviderSelectors.isModelEnabledReasoning(model));
  if (isDeprecatedEdition) return oldValue;
  //

  return newValue;
};
