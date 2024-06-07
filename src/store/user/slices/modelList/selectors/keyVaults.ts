import { UserStore } from '@/store/user';
import {
  GlobalLLMProviderKey,
  OpenAICompatibleKeyVault,
  UserKeyVaults,
} from '@/types/user/settings';

import { currentSettings } from '../../settings/selectors/settings';

export const keyVaultsSettings = (s: UserStore): UserKeyVaults =>
  currentSettings(s).keyVaults || {};

const openAIConfig = (s: UserStore) => keyVaultsSettings(s).openai || {};
const bedrockConfig = (s: UserStore) => keyVaultsSettings(s).bedrock || {};
const ollamaConfig = (s: UserStore) => keyVaultsSettings(s).ollama || {};
const azureConfig = (s: UserStore) => keyVaultsSettings(s).azure || {};
const getVaultByProvider = (provider: GlobalLLMProviderKey) => (s: UserStore) =>
  (keyVaultsSettings(s)[provider] || {}) as OpenAICompatibleKeyVault;

const isProviderEndpointNotEmpty = (provider: string) => (s: UserStore) =>
  !!getVaultByProvider(provider as GlobalLLMProviderKey)(s)?.baseURL;

const password = (s: UserStore) => keyVaultsSettings(s).password || '';

export const keyVaultsConfigSelectors = {
  azureConfig,
  bedrockConfig,
  getVaultByProvider,
  isProviderEndpointNotEmpty,
  ollamaConfig,
  openAIConfig,
  password,
};
