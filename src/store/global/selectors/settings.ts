import { DEFAULT_OPENAI_MODEL_LIST } from '@/const/llm';
import { DEFAULT_LANG } from '@/const/locale';
import { DEFAULT_AGENT_META } from '@/const/meta';
import { DEFAULT_AGENT, DEFAULT_AGENT_CONFIG, DEFAULT_SETTINGS } from '@/const/settings';
import { Locales } from '@/locales/resources';
import { GlobalSettings } from '@/types/settings';
import { isOnServerSide } from '@/utils/env';
import { merge } from '@/utils/merge';

import { GlobalStore } from '../store';

const currentSettings = (s: GlobalStore) => merge(DEFAULT_SETTINGS, s.settings);

const defaultAgent = (s: GlobalStore) => merge(DEFAULT_AGENT, s.settings.defaultAgent);

const defaultAgentConfig = (s: GlobalStore) => merge(DEFAULT_AGENT_CONFIG, defaultAgent(s).config);

const defaultAgentMeta = (s: GlobalStore) => merge(DEFAULT_AGENT_META, defaultAgent(s).meta);

const openAIAPIKeySelectors = (s: GlobalStore) =>
  s.settings.languageModel.openAI.OPENAI_API_KEY || s.settings.OPENAI_API_KEY;

const openAIProxyUrlSelectors = (s: GlobalStore) => s.settings.languageModel.openAI.endpoint;

const modelListSelectors = (s: GlobalStore) => [
  ...DEFAULT_OPENAI_MODEL_LIST,
  ...(s.settings.languageModel.openAI.customModelName || '').split(',').filter(Boolean),
];

export const exportSettings = (s: GlobalStore) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { OPENAI_API_KEY: _, password: __, ...settings } = s.settings;

  return settings as GlobalSettings;
};

const currentLanguage = (s: GlobalStore) => {
  const locale = s.settings.language;

  if (locale === 'auto') {
    if (isOnServerSide) return DEFAULT_LANG;

    return navigator.language as Locales;
  }

  return locale;
};

export const settingsSelectors = {
  currentLanguage,
  currentSettings,
  defaultAgent,
  defaultAgentConfig,
  defaultAgentMeta,
  exportSettings,
  modelList: modelListSelectors,
  openAIAPI: openAIAPIKeySelectors,
  openAIProxyUrl: openAIProxyUrlSelectors,
};
