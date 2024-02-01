import { BedrockProvider, OpenAIProvider, ZhiPuProvider } from '@/config/modelProviders';
import { ModelProviderCard } from '@/types/llm';
import { CustomModels } from '@/types/settings';

import { GlobalStore } from '../../../store';
import { currentSettings } from './settings';

const modelProvider = (s: GlobalStore) => currentSettings(s).languageModel;
const openAIConfig = (s: GlobalStore) => modelProvider(s).openAI;

const openAIAPIKey = (s: GlobalStore) => openAIConfig(s).OPENAI_API_KEY;
const enableAzure = (s: GlobalStore) => openAIConfig(s).useAzure;
const openAIProxyUrl = (s: GlobalStore) => openAIConfig(s).endpoint;

const enableZhipu = (s: GlobalStore) => modelProvider(s).zhipu.enabled;
const zhipuAPIKey = (s: GlobalStore) => modelProvider(s).zhipu.ZHIPU_API_KEY;

const enableBedrock = (s: GlobalStore) => modelProvider(s).bedrock.enabled;

const customModelList = (s: GlobalStore) => {
  let models: CustomModels = [];

  const removedModels: string[] = [];
  const modelNames = [
    ...(s.serverConfig.customModelName || '').split(/[,，]/).filter(Boolean),
    ...(currentSettings(s).languageModel.openAI.customModelName || '')
      .split(/[,，]/)
      .filter(Boolean),
  ];

  for (const item of modelNames) {
    const disable = item.startsWith('-');
    const nameConfig = item.startsWith('+') || item.startsWith('-') ? item.slice(1) : item;
    const [name, displayName] = nameConfig.split('=');

    if (disable) {
      // Disable all models.
      if (name === 'all') {
        models = [];
      }
      removedModels.push(name);
      continue;
    }

    // Remove duplicate model entries.
    const existingIndex = models.findIndex(({ id: n }) => n === name);
    if (existingIndex !== -1) {
      models.splice(existingIndex, 1);
    }

    models.push({
      displayName: displayName || name,
      id: name,
    });
  }

  return models.filter((m) => !removedModels.includes(m.id));
};

const modelSelectList = (s: GlobalStore): ModelProviderCard[] => {
  const customModels = customModelList(s);

  const hasOneAPI = customModels.length > 0;

  return [
    OpenAIProvider,
    enableZhipu(s) ? ZhiPuProvider : null,
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
  enableAzure,
  openAIAPIKey,
  openAIConfig,
  openAIProxyUrl,
  // Zhipu
  enableZhipu,
  zhipuAPIKey,

  // Bedrock
  enableBedrock,
};
