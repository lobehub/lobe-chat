import { uniqBy } from 'lodash-es';

import { ChatModelCard, ModelProviderCard } from '@/types/llm';
import { GeneralModelProviderConfig, GlobalLLMProviderKey } from '@/types/settings';

import { GlobalStore } from '../../../store';
import { modelProviderSelectors } from './modelProvider';
import { currentSettings } from './settings';

const getConfigByProviderId = (provider: string) => (s: GlobalStore) =>
  currentSettings(s).languageModel[provider as GlobalLLMProviderKey] as
    | GeneralModelProviderConfig
    | undefined;

const getModeProviderById = (provider: string) => (s: GlobalStore) =>
  modelProviderSelectors.providerModelList(s).find((s) => s.id === provider);

const isProviderEnabled = (provider: GlobalLLMProviderKey) => (s: GlobalStore) =>
  currentSettings(s).languageModel[provider]?.enabled || false;

const getEnableModelsByProviderId = (provider: string) => (s: GlobalStore) => {
  if (!getConfigByProviderId(provider)(s)?.enabledModels) return;

  return getConfigByProviderId(provider)(s)?.enabledModels?.filter(Boolean);
};

const getModelCardsByProviderId =
  (provider: string) =>
  (s: GlobalStore): ChatModelCard[] => {
    const builtinCards = getModeProviderById(provider)(s)?.chatModels || [];

    const userCards = (getConfigByProviderId(provider)(s)?.customModelCards || []).map((model) => ({
      ...model,
      isCustom: true,
    }));

    return uniqBy([...userCards, ...builtinCards], 'id');
  };

const getCustomModelCard =
  ({ id, provider }: { id?: string; provider?: string }) =>
  (s: GlobalStore) => {
    if (!provider) return;

    const config = getConfigByProviderId(provider)(s);

    return config?.customModelCards?.find((m) => m.id === id);
  };

const providerListWithConfig = (s: GlobalStore): ModelProviderCard[] =>
  modelProviderSelectors.providerModelList(s).map((list) => ({
    ...list,
    chatModels: getModelCardsByProviderId(list.id)(s)?.map((model) => {
      const models = getEnableModelsByProviderId(list.id)(s);

      if (!models) return model;

      return {
        ...model,
        enabled: models?.some((m) => m === model.id),
      };
    }),
    enabled: isProviderEnabled(list.id as any)(s),
  }));

const providerListForModelSelect = (s: GlobalStore): ModelProviderCard[] =>
  providerListWithConfig(s)
    .filter((s) => s.enabled)
    .map((provider) => ({
      ...provider,
      chatModels: provider.chatModels.filter((model) => model.enabled),
    }));

const currentEditingCustomModelCard = (s: GlobalStore) => {
  if (!s.editingCustomCardModel) return;
  const { id, provider } = s.editingCustomCardModel;

  return getCustomModelCard({ id, provider })(s);
};

const isAutoFetchModelsEnabled =
  (provider: GlobalLLMProviderKey) =>
  (s: GlobalStore): boolean => {
    return getConfigByProviderId(provider)(s)?.autoFetchModelLists || false;
  };

const llmSettings = (s: GlobalStore) => currentSettings(s).languageModel;

const openAIConfig = (s: GlobalStore) => llmSettings(s).openai;
const bedrockConfig = (s: GlobalStore) => llmSettings(s).bedrock;
const ollamaConfig = (s: GlobalStore) => llmSettings(s).ollama;
const azureConfig = (s: GlobalStore) => llmSettings(s).azure;

const isAzureEnabled = (s: GlobalStore) => llmSettings(s).azure.enabled;

/* eslint-disable sort-keys-fix/sort-keys-fix,  */
export const modelConfigSelectors = {
  isAutoFetchModelsEnabled,
  isProviderEnabled,
  currentEditingCustomModelCard,

  getConfigByProviderId,
  getEnableModelsByProviderId,
  getModelCardsByProviderId,
  getCustomModelCard,

  providerListWithConfig,
  providerListForModelSelect,

  openAIConfig,
  azureConfig,
  bedrockConfig,
  ollamaConfig,

  isAzureEnabled,
};
