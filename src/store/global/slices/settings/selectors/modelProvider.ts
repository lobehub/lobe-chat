import { produce } from 'immer';

import {
  BedrockProvider,
  GoogleProvider,
  LOBE_DEFAULT_MODEL_LIST,
  OpenAIProvider,
  ZhiPuProvider,
} from '@/config/modelProviders';
import { ChatModelCard, ModelProviderCard } from '@/types/llm';
import { parseModelString } from '@/utils/parseModels';

import { GlobalStore } from '../../../store';
import { currentSettings } from './settings';

const modelProvider = (s: GlobalStore) => currentSettings(s).languageModel;
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

// const azureModelList = (s: GlobalStore): ModelProviderCard => {
//   const azure = azureConfig(s);
//   return {
//     chatModels: parseModelString(azure.deployments),
//     id: 'azure',
//   };
// };

// 提取处理 chatModels 的专门方法
const processChatModels = (modelConfig: ReturnType<typeof parseModelString>): ChatModelCard[] => {
  let chatModels = modelConfig.removeAll ? [] : OpenAIProvider.chatModels;

  // 处理移除逻辑
  if (!modelConfig.removeAll) {
    chatModels = chatModels.filter((m) => !modelConfig.removed.includes(m.id));
  }

  return produce(chatModels, (draft) => {
    // 处理添加或替换逻辑
    for (const customModel of modelConfig.add) {
      // 首先尝试在 LOBE_DEFAULT_MODEL_LIST 中查找模型
      const defaultModel = LOBE_DEFAULT_MODEL_LIST.find((model) => model.id === customModel.id);

      // 如果在默认列表中找到了模型，则基于该模型进行更新
      if (defaultModel) {
        const model = draft.find((model) => model.id === customModel.id);
        // 如果当前 chatModels 中已有该模型，更新它
        if (model) {
          if (model.hidden) delete model.hidden;
          if (customModel.displayName) model.displayName = customModel.displayName;
        } else {
          // 如果当前 chatModels 中没有该模型，添加它
          draft.push({
            ...defaultModel,
            displayName: customModel.displayName || defaultModel.displayName,
          });
        }
      } else {
        // 如果在默认列表中未找到模型，作为新的自定义模型添加
        draft.push({
          ...customModel,
          displayName: customModel.displayName || customModel.id,
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

  return [
    {
      ...OpenAIProvider,
      chatModels,
    },
    // { ...azureModelList(s), enabled: enableAzure(s) },
    { ...ZhiPuProvider, enabled: enableZhipu(s) },
    { ...GoogleProvider, enabled: enableGoogle(s) },
    { ...BedrockProvider, enabled: enableBedrock(s) },
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

const modelHasMaxToken = (id: string) => (s: GlobalStore) =>
  typeof modelCardById(id)(s)?.tokens !== 'undefined';

const modelMaxToken = (id: string) => (s: GlobalStore) => modelCardById(id)(s)?.tokens || 0;

/* eslint-disable sort-keys-fix/sort-keys-fix,  */
export const modelProviderSelectors = {
  modelSelectList,

  modelCardById,
  modelMaxToken,
  modelEnabledFunctionCall,
  modelEnabledVision,
  modelHasMaxToken,
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
};
