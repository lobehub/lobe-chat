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
import { ModelProviderCard } from '@/types/llm';
import { transformToChatModelCards } from '@/utils/parseModels';

import { GlobalStore } from '../../../store';
import { currentSettings } from './settings';

// const azureModelList = (s: GlobalStore): ModelProviderCard => {
//   const azure = azureConfig(s);
//   return {
//     chatModels: parseModelString(azure.deployments),
//     id: 'azure',
//   };
// };

/**
 * define all the model list of providers
 */
const providerModelList = (s: GlobalStore): ModelProviderCard[] => {
  const openaiChatModels = transformToChatModelCards(s.serverConfig.customModelName);

  const ollamaChatModels = transformToChatModelCards(
    s.serverConfig.languageModel?.ollama?.customModelName,
    OllamaProvider.chatModels,
  );

  const openrouterChatModels = transformToChatModelCards(
    s.serverConfig.languageModel?.openrouter?.customModelName,
    OpenRouterProvider.chatModels,
  );

  const togetheraiChatModels = transformToChatModelCards(
    currentSettings(s).languageModel.togetherai.customModelName,
    TogetherAIProvider.chatModels,
  );

  return [
    {
      ...OpenAIProvider,
      chatModels: openaiChatModels,
    },
    // { ...azureModelList(s), enabled: enableAzure(s) },
    { ...OllamaProvider, chatModels: ollamaChatModels },
    AnthropicProvider,
    GoogleProvider,
    { ...OpenRouterProvider, chatModels: openrouterChatModels },
    { ...TogetherAIProvider, chatModels: togetheraiChatModels },
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
