import { DEFAULT_LANG } from '@/const/locale';
import { DEFAULT_AGENT_META } from '@/const/meta';
import {
  DEFAULT_AGENT,
  DEFAULT_AGENT_CONFIG,
  DEFAULT_SYSTEM_AGENT_CONFIG,
  DEFAULT_TTS_CONFIG,
} from '@/const/settings';
import { Locales } from '@/locales/resources';
import { GeneralModelProviderConfig, GlobalLLMProviderKey, GlobalSettings } from '@/types/settings';
import { isOnServerSide } from '@/utils/env';
import { merge } from '@/utils/merge';

import { UserStore } from '../../../store';

export const currentSettings = (s: UserStore): GlobalSettings =>
  merge(s.defaultSettings, s.settings);

export const currentLLMSettings = (s: UserStore) => currentSettings(s).languageModel;

export const getProviderConfigById = (provider: string) => (s: UserStore) =>
  currentLLMSettings(s)[provider as GlobalLLMProviderKey] as GeneralModelProviderConfig | undefined;

const password = (s: UserStore) => currentSettings(s).password;

const currentTTS = (s: UserStore) => merge(DEFAULT_TTS_CONFIG, currentSettings(s).tts);

const defaultAgent = (s: UserStore) => merge(DEFAULT_AGENT, currentSettings(s).defaultAgent);
const defaultAgentConfig = (s: UserStore) => merge(DEFAULT_AGENT_CONFIG, defaultAgent(s).config);

const defaultAgentMeta = (s: UserStore) => merge(DEFAULT_AGENT_META, defaultAgent(s).meta);

// TODO: Maybe we can also export settings difference
const exportSettings = (s: UserStore) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _, ...settings } = currentSettings(s);

  return settings as GlobalSettings;
};

const currentLanguage = (s: UserStore) => {
  const locale = currentSettings(s).language;

  if (locale === 'auto') {
    if (isOnServerSide) return DEFAULT_LANG;

    return navigator.language as Locales;
  }

  return locale;
};

export const currentThemeMode = (s: UserStore) => {
  const themeMode = currentSettings(s).themeMode;
  return themeMode || 'auto';
};

const dalleConfig = (s: UserStore) => currentSettings(s).tool?.dalle || {};
const isDalleAutoGenerating = (s: UserStore) => currentSettings(s).tool?.dalle?.autoGenerate;

const currentSystemAgent = (s: UserStore) =>
  merge(DEFAULT_SYSTEM_AGENT_CONFIG, currentSettings(s).systemAgent);

export const settingsSelectors = {
  currentLanguage,
  currentSettings,
  currentSystemAgent,
  currentTTS,
  currentThemeMode,
  dalleConfig,
  defaultAgent,
  defaultAgentConfig,
  defaultAgentMeta,
  exportSettings,
  isDalleAutoGenerating,
  password,
  providerConfig: getProviderConfigById,
};
