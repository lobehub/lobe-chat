import { aiModelSelectors, getAiInfraStoreState } from '@/store/aiInfra';

export const isCanUseFC = (model: string, provider: string): boolean => {
  return aiModelSelectors.isModelSupportToolUse(model, provider)(getAiInfraStoreState()) || false;
};
