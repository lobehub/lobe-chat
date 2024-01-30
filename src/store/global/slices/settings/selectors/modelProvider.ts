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

/* eslint-disable sort-keys-fix/sort-keys-fix,  */
export const modelProviderSelectors = {
  modelList: customModelList,
  modelSelectList,
  // OpenAI
  enableAzure,
  openAIAPIKey,
  openAIConfig,
  openAIProxyUrl,
  // Zhipu
  enableZhipu,
  zhipuAPIKey,
};
