import { isProviderDisableBrowserRequest } from '@/config/modelProviders';
import { isDesktop } from '@/const/version';
import { UserStore } from '@/store/user';
import { GlobalLLMProviderKey } from '@/types/user/settings';

import { currentLLMSettings, getProviderConfigById } from '../../settings/selectors/settings';
import { keyVaultsConfigSelectors } from './keyVaults';

const isProviderEnabled = (provider: GlobalLLMProviderKey) => (s: UserStore) =>
  getProviderConfigById(provider)(s)?.enabled || false;

const providerWhitelist = new Set(['ollama', 'lmstudio']);
/**
 * @description The conditions to enable client fetch
 * 1. If no baseUrl and apikey input, force on Server.
 * 2. If only contains baseUrl, force on Client
 * 3. Follow the user settings.
 * 4. On Server, by default.
 */
const isProviderFetchOnClient = (provider: GlobalLLMProviderKey | string) => (s: UserStore) => {
  const config = getProviderConfigById(provider)(s);

  // if is desktop, force on Server.
  if (isDesktop) return false;

  // If the provider already disable browser request in model config, force on Server.
  if (isProviderDisableBrowserRequest(provider)) return false;

  // If the provider in the whitelist, follow the user settings
  if (providerWhitelist.has(provider) && typeof config?.fetchOnClient !== 'undefined')
    return config?.fetchOnClient;

  // 1. If no baseUrl and apikey input, force on Server.
  const isProviderEndpointNotEmpty =
    keyVaultsConfigSelectors.isProviderEndpointNotEmpty(provider)(s);
  const isProviderApiKeyNotEmpty = keyVaultsConfigSelectors.isProviderApiKeyNotEmpty(provider)(s);
  if (!isProviderEndpointNotEmpty && !isProviderApiKeyNotEmpty) return false;

  // 2. If only contains baseUrl, force on Client
  if (isProviderEndpointNotEmpty && !isProviderApiKeyNotEmpty) return true;

  // 3. Follow the user settings.
  if (typeof config?.fetchOnClient !== 'undefined') return config?.fetchOnClient;

  // 4. On Server, by default.
  return false;
};

const getCustomModelCard =
  ({ id, provider }: { id?: string; provider?: string }) =>
  (s: UserStore) => {
    if (!provider) return;

    const config = getProviderConfigById(provider)(s);

    return config?.customModelCards?.find((m) => m.id === id);
  };

const currentEditingCustomModelCard = (s: UserStore) => {
  if (!s.editingCustomCardModel) return;
  const { id, provider } = s.editingCustomCardModel;

  return getCustomModelCard({ id, provider })(s);
};

const isAutoFetchModelsEnabled =
  (provider: GlobalLLMProviderKey) =>
  (s: UserStore): boolean => {
    return getProviderConfigById(provider)(s)?.autoFetchModelLists || false;
  };

const openAIConfig = (s: UserStore) => currentLLMSettings(s).openai;
const bedrockConfig = (s: UserStore) => currentLLMSettings(s).bedrock;
const ollamaConfig = (s: UserStore) => currentLLMSettings(s).ollama;
const azureConfig = (s: UserStore) => currentLLMSettings(s).azure;
const cloudflareConfig = (s: UserStore) => currentLLMSettings(s).cloudflare;

const isAzureEnabled = (s: UserStore) => currentLLMSettings(s).azure.enabled;

export const modelConfigSelectors = {
  azureConfig,
  bedrockConfig,
  cloudflareConfig,

  currentEditingCustomModelCard,
  getCustomModelCard,

  isAutoFetchModelsEnabled,
  isAzureEnabled,
  isProviderEnabled,
  isProviderFetchOnClient,

  ollamaConfig,
  openAIConfig,
};
