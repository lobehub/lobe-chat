import {
  BedrockProvider,
  GoogleProvider,
  OpenAIProvider,
  ZhiPuProvider,
} from '@/config/modelProviders';
import { ModelProviderCard } from '@/types/llm';
import { parseModelString } from '@/utils/parseModels';

import { GlobalStore } from '../../../store';
import { currentSettings } from './settings';

const modelProvider = (s: GlobalStore) => currentSettings(s).languageModel;
const openAIConfig = (s: GlobalStore) => modelProvider(s).openAI;

const openAIAPIKey = (s: GlobalStore) => openAIConfig(s).OPENAI_API_KEY;
const openAIProxyUrl = (s: GlobalStore) => openAIConfig(s).endpoint;

const enableZhipu = (s: GlobalStore) => modelProvider(s).zhipu.enabled;
const zhipuAPIKey = (s: GlobalStore) => modelProvider(s).zhipu.apiKey;

const enableBedrock = (s: GlobalStore) => modelProvider(s).bedrock.enabled;
const bedrockConfig = (s: GlobalStore) => modelProvider(s).bedrock;

const enableGoogle = (s: GlobalStore) => modelProvider(s).google.enabled;
const googleAPIKey = (s: GlobalStore) => modelProvider(s).google.apiKey;

const enableAzure = (s: GlobalStore) => modelProvider(s).azure.enabled;
const azureConfig = (s: GlobalStore) => modelProvider(s).azure;

const customModelList = (s: GlobalStore) => {
  const string = [
    s.serverConfig.customModelName,
    currentSettings(s).languageModel.openAI.customModelName,
  ]
    .filter(Boolean)
    .join(',');

  return parseModelString(string);
};

const azureModelList = (s: GlobalStore): ModelProviderCard => {
  const azure = azureConfig(s);
  return {
    chatModels: parseModelString(azure.deployments),
    id: 'azure',
  };
};

const modelSelectList = (s: GlobalStore): ModelProviderCard[] => {
  const customModels = customModelList(s);

  const hasOneAPI = customModels.length > 0;

  return [
    OpenAIProvider,
    enableAzure(s) ? azureModelList(s) : null,
    enableZhipu(s) ? ZhiPuProvider : null,
    enableGoogle(s) ? GoogleProvider : null,
    enableBedrock(s) ? BedrockProvider : null,
    hasOneAPI
      ? {
          chatModels: customModels,
          id: 'oneapi',
        }
      : null,
  ].filter(Boolean) as ModelProviderCard[];
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
  modelList: customModelList,
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
  // Google
  enableGoogle,
  googleAPIKey,
  // Bedrock
  enableBedrock,
  bedrockConfig,
};
