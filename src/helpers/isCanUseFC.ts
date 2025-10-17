import { isDeprecatedEdition } from '@/const/version';
import { aiModelSelectors, getAiInfraStoreState } from '@/store/aiInfra';
import { getUserStoreState } from '@/store/user';
import { modelProviderSelectors } from '@/store/user/selectors';

export const isCanUseFC = (model: string, provider: string): boolean => {
  // TODO: remove isDeprecatedEdition condition in V2.0
  if (isDeprecatedEdition) {
    return modelProviderSelectors.isModelEnabledFunctionCall(model)(getUserStoreState());
  }

  return aiModelSelectors.isModelSupportToolUse(model, provider)(getAiInfraStoreState()) || false;
};
