import { produce } from 'immer';

import {
  AnthropicProvider,
  BedrockProvider,
  GoogleProvider,
  GroqProvider,
  LOBE_DEFAULT_MODEL_LIST,
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
import { parseModelString } from '@/utils/parseModels';

import { GlobalStore } from '../../../store';
import { currentSettings } from './settings';

/**
 * Extract a special method to process chatModels
 * @param modelConfig
 * @param defaultChartModels
 */
const processChatModels = (
  modelConfig: ReturnType<typeof parseModelString>,
  defaultChartModels = OpenAIProvider.chatModels,
): ChatModelCard[] => {
  let chatModels = modelConfig.removeAll ? [] : defaultChartModels;

  // 处理移除逻辑
  if (!modelConfig.removeAll) {
    chatModels = chatModels.filter((m) => !modelConfig.removed.includes(m.id));
  }

  return produce(chatModels, (draft) => {
    // 处理添加或替换逻辑
    for (const toAddModel of modelConfig.add) {
      // first try to find the model in LOBE_DEFAULT_MODEL_LIST to confirm if it is a known model
      const knownModel = LOBE_DEFAULT_MODEL_LIST.find((model) => model.id === toAddModel.id);

      // if the model is known, update it based on the known model
      if (knownModel) {
        const modelInList = draft.find((model) => model.id === toAddModel.id);

        // if the model is already in chatModels, update it
        if (modelInList) {
          if (modelInList.hidden) delete modelInList.hidden;
          if (toAddModel.displayName) modelInList.displayName = toAddModel.displayName;
        } else {
          // if the model is not in chatModels, add it
          draft.push({
            ...knownModel,
            displayName: toAddModel.displayName || knownModel.displayName || knownModel.id,
            hidden: undefined,
          });
        }
      } else {
        // if the model is not in LOBE_DEFAULT_MODEL_LIST, add it as a new custom model
        draft.push({
          ...toAddModel,
          displayName: toAddModel.displayName || toAddModel.id,
          functionCall: true,
          isCustom: true,
          vision: true,
        });
      }
    }
  });
};

/**
 * define all the model list of providers
 * @param s
 */
const providerModelList = (s: GlobalStore): ModelProviderCard[] => {
  const openaiModelConfig = parseModelString(s.serverConfig.customModelName);

  const openaiChatModels = processChatModels(openaiModelConfig);

  const ollamaModelConfig = parseModelString(s.serverConfig.languageModel?.ollama?.customModelName);

  const ollamaChatModels = processChatModels(ollamaModelConfig, OllamaProvider.chatModels);

  const openRouterModelConfig = parseModelString(
    s.serverConfig.languageModel?.openrouter?.customModelName,
  );

  const openrouterChatModels = processChatModels(
    openRouterModelConfig,
    OpenRouterProvider.chatModels,
  );

  const togetheraiModelConfig = parseModelString(
    currentSettings(s).languageModel.togetherai.customModelName,
  );
  const togetheraiChatModels = processChatModels(
    togetheraiModelConfig,
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
