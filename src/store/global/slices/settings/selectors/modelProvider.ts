import {
  AnthropicProviderCard,
  AzureProviderCard,
  BedrockProviderCard,
  GoogleProviderCard,
  GroqProviderCard,
  MistralProviderCard,
  MoonshotProviderCard,
  OllamaProviderCard,
  OpenAIProviderCard,
  OpenRouterProviderCard,
  PerplexityProviderCard,
  TogetherAIProviderCard,
  ZeroOneProviderCard,
  ZhiPuProviderCard,
  filterEnabledModels,
} from '@/config/modelProviders';
import { ChatModelCard, ModelProviderCard } from '@/types/llm';
import { ServerModelProviderConfig } from '@/types/serverConfig';
import { GlobalLLMProviderKey } from '@/types/settings';

import { GlobalStore } from '../../../store';

/**
 * get the server side model cards
 */
const serverProviderModelCards =
  (provider: GlobalLLMProviderKey) =>
  (s: GlobalStore): ChatModelCard[] | undefined => {
    const config = s.serverConfig.languageModel?.[provider] as
      | ServerModelProviderConfig
      | undefined;

    if (!config) return;

    return config.serverModelCards;
  };

const remoteProviderModelCards =
  (provider: GlobalLLMProviderKey) =>
  (s: GlobalStore): ChatModelCard[] | undefined => {
    const cards = s.settings.languageModel?.[provider]?.remoteModelCards as
      | ChatModelCard[]
      | undefined;

    if (!cards) return;

    return cards;
  };

/**
 * define all the model list of providers
 */
const providerModelList = (s: GlobalStore): ModelProviderCard[] => {
  /**
   * Because we have several model cards sources, we need to merge the model cards
   * the priority is below:
   * 1 - server side model cards
   * 2 - remote model cards
   * 3 - default model cards
   */

  const mergeModels = (provider: GlobalLLMProviderKey, defaultChatModels: ChatModelCard[]) => {
    // if the chat model is config in the server side, use the server side model cards
    const serverChatModels = serverProviderModelCards(provider)(s);
    const remoteChatModels = remoteProviderModelCards(provider)(s);

    return serverChatModels ?? remoteChatModels ?? defaultChatModels;
  };

  return [
    {
      ...OpenAIProviderCard,
      chatModels: mergeModels('openai', OpenAIProviderCard.chatModels),
    },
    { ...AzureProviderCard, chatModels: [] },
    { ...OllamaProviderCard, chatModels: mergeModels('ollama', OllamaProviderCard.chatModels) },
    AnthropicProviderCard,
    GoogleProviderCard,
    {
      ...OpenRouterProviderCard,
      chatModels: mergeModels('openrouter', OpenRouterProviderCard.chatModels),
    },
    {
      ...TogetherAIProviderCard,
      chatModels: mergeModels('togetherai', TogetherAIProviderCard.chatModels),
    },
    BedrockProviderCard,
    PerplexityProviderCard,
    MistralProviderCard,
    GroqProviderCard,
    MoonshotProviderCard,
    ZeroOneProviderCard,
    ZhiPuProviderCard,
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
