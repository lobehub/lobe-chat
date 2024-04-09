import {
  AnthropicProvider,
  BedrockProvider,
  GoogleProvider,
  GroqProvider,
  MistralProvider,
  MoonshotProvider,
  OllamaProvider,
  OpenAIProvider,
  OpenRouterProvider,
  PerplexityProvider,
  TogetherAIProvider,
  ZeroOneProvider,
  ZhiPuProvider,
  filterEnabledModels,
} from '@/config/modelProviders';
import { ChatModelCard, ModelProviderCard } from '@/types/llm';
import { GeneralModelProviderConfig, GlobalLLMProviderKey } from '@/types/settings';

import { GlobalStore } from '../../../store';

// const azureModelList = (s: GlobalStore): ModelProviderCard => {
//   const azure = azureConfig(s);
//   return {
//     chatModels: parseModelString(azure.deployments),
//     id: 'azure',
//   };
// };

const serverProviderModelCards =
  (provider: GlobalLLMProviderKey) =>
  (s: GlobalStore): ChatModelCard[] | undefined => {
    const config = s.serverConfig.languageModel?.[provider] as
      | GeneralModelProviderConfig
      | undefined;

    if (!config) return;

    return config.serverModelCards;
  };

/**
 * define all the model list of providers
 */
const providerModelList = (s: GlobalStore): ModelProviderCard[] => {
  const openaiChatModels = serverProviderModelCards('openai')(s);
  const ollamaChatModels = serverProviderModelCards('ollama')(s);
  const openrouterChatModels = serverProviderModelCards('openrouter')(s);
  const togetheraiChatModels = serverProviderModelCards('openrouter')(s);

  return [
    {
      ...OpenAIProvider,
      chatModels: openaiChatModels ?? OpenAIProvider.chatModels,
    },
    // { ...azureModelList(s), enabled: enableAzure(s) },
    { ...OllamaProvider, chatModels: ollamaChatModels ?? OllamaProvider.chatModels },
    AnthropicProvider,
    GoogleProvider,
    { ...OpenRouterProvider, chatModels: openrouterChatModels ?? OpenRouterProvider.chatModels },
    { ...TogetherAIProvider, chatModels: togetheraiChatModels ?? TogetherAIProvider.chatModels },
    BedrockProvider,
    PerplexityProvider,
    MistralProvider,
    GroqProvider,
    MoonshotProvider,
    ZeroOneProvider,
    ZhiPuProvider,
  ];
};

const providerCard = (provider: string) => (s: GlobalStore) =>
  providerModelList(s).find((s) => s.id === provider);

/**
 * get the default enabled models for a provider
 * it's a default enabled model list by Lobe Chat
 * e.g. openai is ['gpt-3.5-turbo','gpt-4-turbo-preview','gpt-4-vision-preview']
 */
const defaultEnabledProviderModels = (provider: string) => (s: GlobalStore) => {
  const modelProvider = providerCard(provider)(s);

  if (modelProvider) return filterEnabledModels(modelProvider);

  return undefined;
};

const modelCardById = (id: string) => (s: GlobalStore) => {
  const list = providerModelList(s);

  return list.flatMap((i) => i.chatModels).find((m) => m.id === id);
};

const modelEnabledFunctionCall = (id: string) => (s: GlobalStore) =>
  modelCardById(id)(s)?.functionCall || false;

// vision model white list, these models will change the content from string to array
// refs: https://github.com/lobehub/lobe-chat/issues/790
const modelEnabledVision = (id: string) => (s: GlobalStore) =>
  modelCardById(id)(s)?.vision || id.includes('vision');

const modelEnabledFiles = (id: string) => (s: GlobalStore) => modelCardById(id)(s)?.files;

const modelEnabledUpload = (id: string) => (s: GlobalStore) =>
  modelEnabledVision(id)(s) || modelEnabledFiles(id)(s);

const modelHasMaxToken = (id: string) => (s: GlobalStore) =>
  typeof modelCardById(id)(s)?.tokens !== 'undefined';

const modelMaxToken = (id: string) => (s: GlobalStore) => modelCardById(id)(s)?.tokens || 0;

/* eslint-disable sort-keys-fix/sort-keys-fix,  */
export const modelProviderSelectors = {
  providerModelList,
  providerCard,
  defaultEnabledProviderModels,

  modelCardById,
  modelMaxToken,
  modelHasMaxToken,

  modelEnabledFunctionCall,
  modelEnabledVision,
  modelEnabledFiles,
  modelEnabledUpload,
};
