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

const providerEnabled = (provider: GlobalLLMProviderKey) => (s: GlobalStore) => {
  // TODO: we need to migrate the 'openAI' key to 'openai'
  // @ts-ignore
  if (provider === 'openai') return true;

  return currentSettings(s).languageModel[provider]?.enabled || false;
};

const providerEnableModels = (provider: string) => (s: GlobalStore) => {
  if (!providerConfig(provider)(s)?.enabledModels) return;

  return providerConfig(provider)(s)?.enabledModels?.filter(Boolean);
};

const openAIConfig = (s: GlobalStore) => modelProvider(s).openAI;

const openAIAPIKey = (s: GlobalStore) => openAIConfig(s).OPENAI_API_KEY;
const openAIProxyUrl = (s: GlobalStore) => openAIConfig(s).endpoint;

const enableZhipu = (s: GlobalStore) => modelProvider(s).zhipu.enabled;
const zhipuAPIKey = (s: GlobalStore) => modelProvider(s).zhipu.apiKey;
const zhipuProxyUrl = (s: GlobalStore) => modelProvider(s).zhipu.endpoint;

const enableBedrock = (s: GlobalStore) => modelProvider(s).bedrock.enabled;
const bedrockConfig = (s: GlobalStore) => modelProvider(s).bedrock;

const enableGoogle = (s: GlobalStore) => modelProvider(s).google.enabled;
const googleAPIKey = (s: GlobalStore) => modelProvider(s).google.apiKey;
const googleProxyUrl = (s: GlobalStore) => modelProvider(s).google.endpoint;

const enableAzure = (s: GlobalStore) => modelProvider(s).openAI.useAzure;
const azureConfig = (s: GlobalStore) => modelProvider(s).azure;

const enableMistral = (s: GlobalStore) => modelProvider(s).mistral.enabled;
const mistralAPIKey = (s: GlobalStore) => modelProvider(s).mistral.apiKey;

const enableMoonshot = (s: GlobalStore) => modelProvider(s).moonshot.enabled;
const moonshotAPIKey = (s: GlobalStore) => modelProvider(s).moonshot.apiKey;

const enableOllama = (s: GlobalStore) => modelProvider(s).ollama.enabled;
const ollamaProxyUrl = (s: GlobalStore) => modelProvider(s).ollama.endpoint;

const enablePerplexity = (s: GlobalStore) => modelProvider(s).perplexity.enabled;
const perplexityAPIKey = (s: GlobalStore) => modelProvider(s).perplexity.apiKey;

const enableAnthropic = (s: GlobalStore) => modelProvider(s).anthropic.enabled;
const anthropicAPIKey = (s: GlobalStore) => modelProvider(s).anthropic.apiKey;
const anthropicProxyUrl = (s: GlobalStore) => modelProvider(s).anthropic.endpoint;

const enableGroq = (s: GlobalStore) => modelProvider(s).groq.enabled;
const groqAPIKey = (s: GlobalStore) => modelProvider(s).groq.apiKey;

const enableOpenrouter = (s: GlobalStore) => modelProvider(s).openrouter.enabled;
const openrouterAPIKey = (s: GlobalStore) => modelProvider(s).openrouter.apiKey;

const enableTogetherAI = (s: GlobalStore) => modelProvider(s).togetherai.enabled;
const togetheraiAPIKey = (s: GlobalStore) => modelProvider(s).togetherai.apiKey;

const enableZeroone = (s: GlobalStore) => modelProvider(s).zeroone.enabled;
const zerooneAPIKey = (s: GlobalStore) => modelProvider(s).zeroone.apiKey;

// const azureModelList = (s: GlobalStore): ModelProviderCard => {
//   const azure = azureConfig(s);
//   return {
//     chatModels: parseModelString(azure.deployments),
//     id: 'azure',
//   };
// };

const modelSelectList = (s: GlobalStore): ModelProviderCard[] => {
  return modelProviderSelectors.providerModelList(s).map((list) => ({
    ...list,
    chatModels: list.chatModels.map((model) => {
      const models = providerEnableModels(list.id)(s);

      if (!models) return model;

      return {
        ...model,
        hidden: !models?.some((m) => m === model.id),
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
      chatModels: provider.chatModels.filter((model) => !model.hidden),
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

    return uniqBy([...builtinCards, ...userCards], 'id');
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

  return getCustomModelCardById({ id, provider });
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

  // OpenAI
  openAIConfig,
  openAIAPIKey,
  openAIProxyUrl,
  // Azure OpenAI
  enableAzure,
  azureConfig,
  // Zhipu
  enableZhipu,
  zhipuAPIKey,
  zhipuProxyUrl,
  // Google
  enableGoogle,
  googleAPIKey,
  googleProxyUrl,
  // Bedrock
  enableBedrock,
  bedrockConfig,

  // Moonshot
  enableMoonshot,
  moonshotAPIKey,

  // Ollama
  enableOllama,
  ollamaProxyUrl,

  // Perplexity
  enablePerplexity,
  perplexityAPIKey,

  // Anthropic
  enableAnthropic,
  anthropicAPIKey,
  anthropicProxyUrl,

  // Mistral
  enableMistral,
  mistralAPIKey,

  // Groq
  enableGroq,
  groqAPIKey,

  // OpenRouter
  enableOpenrouter,
  openrouterAPIKey,

  // ZeroOne 零一万物
  enableZeroone,
  zerooneAPIKey,

  // TogetherAI
  enableTogetherAI,
  togetheraiAPIKey,
};
