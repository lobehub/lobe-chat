import { isDeprecatedEdition } from '@lobechat/const';
import { ModelProvider } from 'model-bank';

import { getAgentStoreState } from '@/store/agent';
import { agentChatConfigSelectors } from '@/store/agent/selectors';
import { getAiInfraStoreState } from '@/store/aiInfra';
import { aiModelSelectors, aiProviderSelectors } from '@/store/aiInfra/selectors';
import { getUserStoreState, useUserStore } from '@/store/user';
import { modelConfigSelectors, modelProviderSelectors } from '@/store/user/selectors';

export const isCanUseFC = (model: string, provider: string): boolean => {
  // TODO: remove isDeprecatedEdition condition in V2.0
  if (isDeprecatedEdition) {
    return modelProviderSelectors.isModelEnabledFunctionCall(model)(getUserStoreState());
  }

  return aiModelSelectors.isModelSupportToolUse(model, provider)(getAiInfraStoreState()) || false;
};

export const isCanUseVision = (model: string, provider: string): boolean => {
  // TODO: remove isDeprecatedEdition condition in V2.0
  if (isDeprecatedEdition) {
    return modelProviderSelectors.isModelEnabledVision(model)(getUserStoreState());
  }
  return aiModelSelectors.isModelSupportVision(model, provider)(getAiInfraStoreState());
};

export const isCanUseVideo = (model: string, provider: string): boolean => {
  return aiModelSelectors.isModelSupportVideo(model, provider)(getAiInfraStoreState()) || false;
};

/**
 * TODO: we need to update this function to auto find deploymentName with provider setting config
 */
export const findDeploymentName = (model: string, provider: string) => {
  let deploymentId = model;

  // TODO: remove isDeprecatedEdition condition in V2.0
  if (isDeprecatedEdition) {
    const chatModelCards = modelProviderSelectors.getModelCardsById(ModelProvider.Azure)(
      useUserStore.getState(),
    );

    const deploymentName = chatModelCards.find((i) => i.id === model)?.deploymentName;
    if (deploymentName) deploymentId = deploymentName;
  } else {
    // find the model by id
    const modelItem = getAiInfraStoreState().enabledAiModels?.find(
      (i) => i.id === model && i.providerId === provider,
    );

    if (modelItem && modelItem.config?.deploymentName) {
      deploymentId = modelItem.config?.deploymentName;
    }
  }

  return deploymentId;
};

export const isEnableFetchOnClient = (provider: string) => {
  // TODO: remove this condition in V2.0
  if (isDeprecatedEdition) {
    return modelConfigSelectors.isProviderFetchOnClient(provider)(useUserStore.getState());
  } else {
    return aiProviderSelectors.isProviderFetchOnClient(provider)(getAiInfraStoreState());
  }
};

/**
 * Search configuration result
 */
export interface SearchConfig {
  /** Whether search is enabled in chat config */
  enabledSearch: boolean;
  /** Whether model has builtin search capability */
  isModelHasBuiltinSearch: boolean;
  /** Whether provider has builtin search capability */
  isProviderHasBuiltinSearch: boolean;
  /** Whether to use application's builtin search tool */
  useApplicationBuiltinSearchTool: boolean;
  /** Whether to use model's builtin search */
  useModelSearch: boolean;
}

/**
 * Get search configuration for given model and provider
 * This centralizes the search logic that was duplicated across multiple places
 */
export const getSearchConfig = (model: string, provider: string): SearchConfig => {
  const chatConfig = agentChatConfigSelectors.currentChatConfig(getAgentStoreState());
  const aiInfraStoreState = getAiInfraStoreState();

  const enabledSearch = chatConfig.searchMode !== 'off';
  const isProviderHasBuiltinSearch =
    aiProviderSelectors.isProviderHasBuiltinSearch(provider)(aiInfraStoreState);
  const isModelHasBuiltinSearch = aiModelSelectors.isModelHasBuiltinSearch(
    model,
    provider,
  )(aiInfraStoreState);

  const useModelSearch =
    ((isProviderHasBuiltinSearch || isModelHasBuiltinSearch) && chatConfig.useModelBuiltinSearch) ||
    false;

  const useApplicationBuiltinSearchTool = enabledSearch && !useModelSearch;

  return {
    enabledSearch,
    isModelHasBuiltinSearch,
    isProviderHasBuiltinSearch,
    useApplicationBuiltinSearchTool,
    useModelSearch,
  };
};
