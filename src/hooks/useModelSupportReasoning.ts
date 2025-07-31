import { aiModelSelectors, useAiInfraStore } from '@/store/aiInfra';

export const useModelSupportReasoning = (model: string, provider: string) => {
  return useAiInfraStore(aiModelSelectors.isModelSupportReasoning(model, provider));
};
