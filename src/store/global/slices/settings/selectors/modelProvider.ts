import { produce } from 'immer';

import {
  AnthropicProvider,
  BedrockProvider,
  GoogleProvider,
  LOBE_DEFAULT_MODEL_LIST,
  MoonshotProvider,
  OllamaProvider,
  OpenAIProvider,
  PerplexityProvider,
  ZhiPuProvider,
} from '@/config/modelProviders';
import { ChatModelCard, ModelProviderCard } from '@/types/llm';
import { GlobalLLMProviderKey } from '@/types/settings';
import { parseModelString } from '@/utils/parseModels';

import { GlobalStore } from '../../../store';
import { currentSettings } from './settings';

const modelProvider = (s: GlobalStore) => currentSettings(s).languageModel;
const providerEnabled = (provider: GlobalLLMProviderKey) => (s: GlobalStore) =>
  currentSettings(s).languageModel[provider]?.enabled || false;

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

const enableMoonshot = (s: GlobalStore) => modelProvider(s).moonshot.enabled;
const moonshotAPIKey = (s: GlobalStore) => modelProvider(s).moonshot.apiKey;

const enableOllamaConfigInSettings = (s: GlobalStore) =>
  s.serverConfig.languageModel?.ollama?.enabled || false;

const enableOllama = (s: GlobalStore) => modelProvider(s).ollama.enabled;
const ollamaProxyUrl = (s: GlobalStore) => modelProvider(s).ollama.endpoint;

const enablePerplexity = (s: GlobalStore) => modelProvider(s).perplexity.enabled;
const perplexityAPIKey = (s: GlobalStore) => modelProvider(s).perplexity.apiKey;

const enableAnthropic = (s: GlobalStore) => modelProvider(s).anthropic.enabled;
const anthropicAPIKey = (s: GlobalStore) => modelProvider(s).anthropic.apiKey;

// const azureModelList = (s: GlobalStore): ModelProviderCard => {
//   const azure = azureConfig(s);
//   return {
//     chatModels: parseModelString(azure.deployments),
//     id: 'azure',
//   };
// };

// 提取处理 chatModels 的专门方法
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

const modelSelectList = (s: GlobalStore): ModelProviderCard[] => {
  const string = [
    s.serverConfig.customModelName,
    currentSettings(s).languageModel.openAI.customModelName,
  ]
    .filter(Boolean)
    .join(',');

  const modelConfig = parseModelString(string);

  const chatModels = processChatModels(modelConfig);

  const ollamaModelConfig = parseModelString(
    currentSettings(s).languageModel.ollama.customModelName,
  );

  const ollamaChatModels = processChatModels(ollamaModelConfig, OllamaProvider.chatModels);

  return [
    {
      ...OpenAIProvider,
      chatModels,
    },
    // { ...azureModelList(s), enabled: enableAzure(s) },
    { ...ZhiPuProvider, enabled: enableZhipu(s) },
    { ...MoonshotProvider, enabled: enableMoonshot(s) },
    { ...GoogleProvider, enabled: enableGoogle(s) },
    { ...BedrockProvider, enabled: enableBedrock(s) },
    { ...OllamaProvider, chatModels: ollamaChatModels, enabled: enableOllama(s) },
    { ...PerplexityProvider, enabled: enablePerplexity(s) },
    { ...AnthropicProvider, enabled: enableAnthropic(s) },
  ];
};

const modelCardById = (id: string) => (s: GlobalStore) => {
  const list = modelSelectList(s);

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
  modelSelectList,

  modelCardById,
  modelMaxToken,
  modelHasMaxToken,

  modelEnabledFunctionCall,
  modelEnabledVision,
  modelEnabledFiles,
  modelEnabledUpload,

  modelProviderConfig: modelProvider,
  providerEnabled,

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
  enableOllamaConfigInSettings,
  enableOllama,
  ollamaProxyUrl,

  // Perplexity
  enablePerplexity,
  perplexityAPIKey,

  // Anthropic
  enableAnthropic,
  anthropicAPIKey,
};
