import { isServerMode } from '@/const/version';
import { aiModelSelectors, useAiInfraStore } from '@/store/aiInfra';
import { useUserStore } from '@/store/user';
import { modelProviderSelectors } from '@/store/user/selectors';

export const useModelContextWindowTokens = (model: string, provider: string) => {
  const newValue = useAiInfraStore(aiModelSelectors.modelContextWindowTokens(model, provider));

  // TODO: remove this in V2.0
  const oldValue = useUserStore(modelProviderSelectors.modelMaxToken(model));
  if (!isServerMode) return oldValue;
  //

  return newValue as number;
};
