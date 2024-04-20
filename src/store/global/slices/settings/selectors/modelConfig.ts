import { GlobalLLMProviderKey } from '@/types/settings';

import { GlobalStore } from '../../../store';
import { currentLLMSettings, getProviderConfigById } from './settings';

const isProviderEnabled = (provider: GlobalLLMProviderKey) => (s: GlobalStore) =>
  getProviderConfigById(provider)(s)?.enabled || false;

const isProviderEndpointNotEmpty = (provider: GlobalLLMProviderKey | string) => (s: GlobalStore) =>
  !!getProviderConfigById(provider)(s)?.endpoint;

const isProviderFetchOnClient = (provider: GlobalLLMProviderKey | string) => (s: GlobalStore) => {
  const config = getProviderConfigById(provider)(s);
  if (typeof config?.fetchOnClient !== 'undefined') return config?.fetchOnClient;

  return isProviderEndpointNotEmpty(provider)(s);
};

const getCustomModelCard =
  ({ id, provider }: { id?: string; provider?: string }) =>
  (s: GlobalStore) => {
    if (!provider) return;

    const config = getProviderConfigById(provider)(s);

    return config?.customModelCards?.find((m) => m.id === id);
  };

const currentEditingCustomModelCard = (s: GlobalStore) => {
  if (!s.editingCustomCardModel) return;
  const { id, provider } = s.editingCustomCardModel;

  return getCustomModelCard({ id, provider })(s);
};

const isAutoFetchModelsEnabled =
  (provider: GlobalLLMProviderKey) =>
  (s: GlobalStore): boolean => {
    return getProviderConfigById(provider)(s)?.autoFetchModelLists || false;
  };

const openAIConfig = (s: GlobalStore) => currentLLMSettings(s).openai;
const bedrockConfig = (s: GlobalStore) => currentLLMSettings(s).bedrock;
const ollamaConfig = (s: GlobalStore) => currentLLMSettings(s).ollama;
const azureConfig = (s: GlobalStore) => currentLLMSettings(s).azure;

const isAzureEnabled = (s: GlobalStore) => currentLLMSettings(s).azure.enabled;

export const modelConfigSelectors = {
  azureConfig,
  bedrockConfig,

  currentEditingCustomModelCard,
  getCustomModelCard,

  isAutoFetchModelsEnabled,
  isAzureEnabled,
  isProviderEnabled,
  isProviderEndpointNotEmpty,
  isProviderFetchOnClient,

  ollamaConfig,

  openAIConfig,
};
