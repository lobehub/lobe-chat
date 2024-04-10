import { uniqBy } from 'lodash-es';

import { ChatModelCard, ModelProviderCard } from '@/types/llm';
import { GeneralModelProviderConfig, GlobalLLMProviderKey } from '@/types/settings';

import { GlobalStore } from '../../../store';
import { modelProviderSelectors } from './modelProvider';
import { currentSettings } from './settings';

const modelProvider = (s: GlobalStore) => currentSettings(s).languageModel;

const providerConfig = (provider: string) => (s: GlobalStore) =>
  currentSettings(s).languageModel[provider as GlobalLLMProviderKey] as
    | GeneralModelProviderConfig
    | undefined;

const providerEnabled = (provider: GlobalLLMProviderKey) => (s: GlobalStore) =>
  currentSettings(s).languageModel[provider]?.enabled || false;

const providerEnableModels = (provider: string) => (s: GlobalStore) => {
  if (!providerConfig(provider)(s)?.enabledModels) return;

  return providerConfig(provider)(s)?.enabledModels?.filter(Boolean);
};

const openAIConfig = (s: GlobalStore) => modelProvider(s).openai;

const openAIAPIKey = (s: GlobalStore) => modelProvider(s).openai.apiKey;
const openAIProxyUrl = (s: GlobalStore) => modelProvider(s).openai.endpoint;

const zhipuAPIKey = (s: GlobalStore) => modelProvider(s).zhipu.apiKey;

const bedrockConfig = (s: GlobalStore) => modelProvider(s).bedrock;

const googleAPIKey = (s: GlobalStore) => modelProvider(s).google.apiKey;

const enableAzure = (s: GlobalStore) => modelProvider(s).azure.enabled;
const azureConfig = (s: GlobalStore) => modelProvider(s).azure;

const mistralAPIKey = (s: GlobalStore) => modelProvider(s).mistral.apiKey;

const moonshotAPIKey = (s: GlobalStore) => modelProvider(s).moonshot.apiKey;

const ollamaProxyUrl = (s: GlobalStore) => modelProvider(s).ollama.endpoint;

const perplexityAPIKey = (s: GlobalStore) => modelProvider(s).perplexity.apiKey;

const anthropicAPIKey = (s: GlobalStore) => modelProvider(s).anthropic.apiKey;
const anthropicProxyUrl = (s: GlobalStore) => modelProvider(s).anthropic.endpoint;

const groqAPIKey = (s: GlobalStore) => modelProvider(s).groq.apiKey;

const openrouterAPIKey = (s: GlobalStore) => modelProvider(s).openrouter.apiKey;

const togetheraiAPIKey = (s: GlobalStore) => modelProvider(s).togetherai.apiKey;

const zerooneAPIKey = (s: GlobalStore) => modelProvider(s).zeroone.apiKey;

const modelSelectList = (s: GlobalStore): ModelProviderCard[] => {
  return modelProviderSelectors.providerModelList(s).map((list) => ({
    ...list,
    chatModels: list.chatModels.map((model) => {
      const models = providerEnableModels(list.id)(s);

      if (!models) return model;

      return {
        ...model,
        enabled: models?.some((m) => m === model.id),
      };
    }),
    enabled: providerEnabled(list.id as any)(s),
  }));
};

const enabledModelProviderList = (s: GlobalStore): ModelProviderCard[] =>
  modelSelectList(s)
    .filter((s) => s.enabled)
    .map((provider) => ({
      ...provider,
      chatModels: provider.chatModels.filter((model) => model.enabled),
    }));

const providerCard = (provider: string) => (s: GlobalStore) =>
  modelProviderSelectors.providerModelList(s).find((s) => s.id === provider);

const providerModelCards =
  (provider: string) =>
  (s: GlobalStore): ChatModelCard[] => {
    const builtinCards = providerCard(provider)(s)?.chatModels || [];

    const userCards = (providerConfig(provider)(s)?.customModelCards || []).map((model) => ({
      ...model,
      isCustom: true,
    }));

    return uniqBy([...userCards, ...builtinCards], 'id');
  };

const getCustomModelCardById =
  ({ id, provider }: { id?: string; provider?: string }) =>
  (s: GlobalStore) => {
    if (!provider) return;

    const config = providerConfig(provider)(s);

    return config?.customModelCards?.find((m) => m.id === id);
  };

const currentEditingCustomModelCard = (s: GlobalStore) => {
  if (!s.editingCustomCardModel) return;
  const { id, provider } = s.editingCustomCardModel;

  return getCustomModelCardById({ id, provider })(s);
};

const enabledAutoFetchModels =
  (provider: GlobalLLMProviderKey) =>
  (s: GlobalStore): boolean => {
    return providerConfig(provider)(s)?.autoFetchModelLists || false;
  };

/* eslint-disable sort-keys-fix/sort-keys-fix,  */
export const modelConfigSelectors = {
  providerEnabled,
  providerEnableModels,
  providerConfig,
  providerModelCards,
  currentEditingCustomModelCard,
  getCustomModelCardById,

  modelSelectList,
  enabledModelProviderList,
  enabledAutoFetchModels,

  // OpenAI
  openAIConfig,
  openAIAPIKey,
  openAIProxyUrl,

  // Azure OpenAI
  enableAzure,
  azureConfig,
  // Zhipu
  zhipuAPIKey,
  // Google
  googleAPIKey,

  // Bedrock
  bedrockConfig,

  // Moonshot
  moonshotAPIKey,

  // Ollama
  ollamaProxyUrl,

  // Perplexity
  perplexityAPIKey,

  // Anthropic
  anthropicAPIKey,
  anthropicProxyUrl,

  // Mistral
  mistralAPIKey,

  // Groq
  groqAPIKey,

  // OpenRouter
  openrouterAPIKey,

  // ZeroOne 零一万物
  zerooneAPIKey,

  // TogetherAI
  togetheraiAPIKey,
};
