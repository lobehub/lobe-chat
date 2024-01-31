import { OpenAIModelCard, ZhiPuModelCard } from '@/config/modelProviders';
import { DEFAULT_OPENAI_MODEL_LIST } from '@/const/llm';
import { ModelProviderCard } from '@/types/llm';
import { CustomModels } from '@/types/settings';

import { GlobalStore } from '../../../store';
import { currentSettings } from './settings';

const openAIConfig = (s: GlobalStore) => currentSettings(s).languageModel.openAI;

const openAIAPIKey = (s: GlobalStore) => openAIConfig(s).OPENAI_API_KEY;
const enableAzure = (s: GlobalStore) => openAIConfig(s).useAzure;
const openAIProxyUrl = (s: GlobalStore) => openAIConfig(s).endpoint;
const zhipuAPIKey = (s: GlobalStore) => currentSettings(s).languageModel.zhipu.ZHIPU_API_KEY;

const enableZhipu = (s: GlobalStore) => currentSettings(s).languageModel.zhipu.enabled;

const customModelList = (s: GlobalStore) => {
  let models: CustomModels = [];

  const removedModels: string[] = [];
  const modelNames = [
    ...DEFAULT_OPENAI_MODEL_LIST,
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
    const existingIndex = models.findIndex(({ name: n }) => n === name);
    if (existingIndex !== -1) {
      models.splice(existingIndex, 1);
    }

    models.push({
      displayName: displayName || name,
      name,
    });
  }

  return models.filter((m) => !removedModels.includes(m.name));
};

const modelSelectList = (s: GlobalStore): ModelProviderCard[] => {
  customModelList(s);

  return [OpenAIModelCard, ZhiPuModelCard];
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
};
