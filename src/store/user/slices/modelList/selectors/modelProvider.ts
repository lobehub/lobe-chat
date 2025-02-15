import { uniqBy } from 'lodash-es';

import { filterEnabledModels } from '@/config/modelProviders';
import { EnabledProviderWithModels } from '@/types/aiModel';
import { ChatModelCard, ModelProviderCard } from '@/types/llm';
import { ServerModelProviderConfig } from '@/types/serverConfig';
import { GlobalLLMProviderKey } from '@/types/user/settings';

import { UserStore } from '../../../store';
import { currentSettings, getProviderConfigById } from '../../settings/selectors/settings';

/**
 * get the server side model cards
 */
const serverProviderModelCards =
  (provider: GlobalLLMProviderKey) =>
  (s: UserStore): ChatModelCard[] | undefined => {
    const config = s.serverLanguageModel?.[provider] as ServerModelProviderConfig | undefined;

    if (!config) return;

    return config.serverModelCards;
  };

const remoteProviderModelCards =
  (provider: GlobalLLMProviderKey) =>
  (s: UserStore): ChatModelCard[] | undefined => {
    const cards = currentSettings(s).languageModel?.[provider]?.remoteModelCards as
      | ChatModelCard[]
      | undefined;

    if (!cards) return;

    return cards;
  };

const isProviderEnabled = (provider: GlobalLLMProviderKey) => (s: UserStore) =>
  getProviderConfigById(provider)(s)?.enabled || false;

// Default Model Provider List

/**
 * define all the model list of providers
 */
const defaultModelProviderList = (s: UserStore): ModelProviderCard[] => s.defaultModelProviderList;

export const getDefaultModeProviderById = (provider: string) => (s: UserStore) =>
  defaultModelProviderList(s).find((s) => s.id === provider);

/**
 * get the default enabled models for a provider
 * it's a default enabled model list by Lobe Chat
 * e.g. openai is ['gpt-4o-mini','gpt-4o','gpt-4-turbo']
 */
const getDefaultEnabledModelsById = (provider: string) => (s: UserStore) => {
  const modelProvider = getDefaultModeProviderById(provider)(s);

  if (modelProvider) return filterEnabledModels(modelProvider);

  return undefined;
};

const getDefaultModelCardById = (id: string) => (s: UserStore) => {
  const list = defaultModelProviderList(s);

  return list.flatMap((i) => i.chatModels).find((m) => m.id === id);
};

// Model Provider List

const getModelCardsById =
  (provider: string) =>
  (s: UserStore): ChatModelCard[] => {
    const builtinCards = getDefaultModeProviderById(provider)(s)?.chatModels || [];

    const userCards = (getProviderConfigById(provider)(s)?.customModelCards || []).map((model) => ({
      ...model,
      isCustom: true,
    }));

    return uniqBy([...userCards, ...builtinCards], 'id');
  };

const getEnableModelsById = (provider: string) => (s: UserStore) => {
  if (!getProviderConfigById(provider)(s)?.enabledModels) return;

  return getProviderConfigById(provider)(s)?.enabledModels?.filter(Boolean);
};

const modelProviderList = (s: UserStore): ModelProviderCard[] => s.modelProviderList;

const modelProviderListForModelSelect = (s: UserStore): EnabledProviderWithModels[] =>
  modelProviderList(s)
    .filter((s) => s.enabled)
    .map((provider) => ({
      ...provider,
      children: provider.chatModels
        .filter((model) => model.enabled)
        .map((m) => ({
          abilities: {
            functionCall: m.functionCall,
            vision: m.vision,
          },
          contextWindowTokens: m.contextWindowTokens,
          displayName: m.displayName,
          id: m.id,
        })),
      source: 'builtin',
    }));

const getModelCardById = (id: string) => (s: UserStore) => {
  const list = modelProviderList(s);

  return list.flatMap((i) => i.chatModels).find((m) => m.id === id);
};

const isModelEnabledFunctionCall = (id: string) => (s: UserStore) =>
  getModelCardById(id)(s)?.functionCall || false;

// vision model white list, these models will change the content from string to array
// refs: https://github.com/lobehub/lobe-chat/issues/790
const isModelEnabledVision = (id: string) => (s: UserStore) =>
  getModelCardById(id)(s)?.vision || id.includes('vision');

const isModelEnabledReasoning = (id: string) => (s: UserStore) =>
  getModelCardById(id)(s)?.reasoning || false;

const isModelEnabledFiles = (id: string) => (s: UserStore) => getModelCardById(id)(s)?.files;

const isModelEnabledUpload = (id: string) => (s: UserStore) =>
  isModelEnabledVision(id)(s) || isModelEnabledFiles(id)(s);

const isModelHasMaxToken = (id: string) => (s: UserStore) =>
  typeof getModelCardById(id)(s)?.contextWindowTokens !== 'undefined';

const modelMaxToken = (id: string) => (s: UserStore) =>
  getModelCardById(id)(s)?.contextWindowTokens || 0;

export const modelProviderSelectors = {
  defaultModelProviderList,
  getDefaultEnabledModelsById,
  getDefaultModelCardById,

  getEnableModelsById,
  getModelCardById,

  getModelCardsById,
  isModelEnabledFiles,
  isModelEnabledFunctionCall,
  isModelEnabledReasoning,
  isModelEnabledUpload,
  isModelEnabledVision,
  isModelHasMaxToken,

  isProviderEnabled,

  modelMaxToken,
  modelProviderList,

  modelProviderListForModelSelect,

  remoteProviderModelCards,
  serverProviderModelCards,
};
