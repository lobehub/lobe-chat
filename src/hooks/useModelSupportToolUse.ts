import { isServerMode } from '@/const/version';
import { aiModelSelectors, useAiInfraStore } from '@/store/aiInfra';
import { useUserStore } from '@/store/user';
import { modelProviderSelectors } from '@/store/user/selectors';

export const useModelSupportToolUse = (model: string) => {
  const newValue = useAiInfraStore(aiModelSelectors.isModelSupportToolUse(model));

  // TODO: remove this in V2.0
  const oldValue = useUserStore(modelProviderSelectors.isModelEnabledFunctionCall(model));
  if (!isServerMode) return oldValue;
  //

  return newValue;
};
