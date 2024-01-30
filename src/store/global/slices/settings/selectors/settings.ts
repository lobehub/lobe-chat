import { DEFAULT_LANG } from '@/const/locale';
import { DEFAULT_AGENT_META } from '@/const/meta';
import { DEFAULT_AGENT, DEFAULT_AGENT_CONFIG, DEFAULT_TTS_CONFIG } from '@/const/settings';
import { Locales } from '@/locales/resources';
import { GlobalSettings } from '@/types/settings';
import { isOnServerSide } from '@/utils/env';
import { merge } from '@/utils/merge';

import { GlobalStore } from '../../../store';

export const currentSettings = (s: GlobalStore): GlobalSettings =>
  merge(s.defaultSettings, s.settings);

const password = (s: GlobalStore) => currentSettings(s).password;

const currentTTS = (s: GlobalStore) => merge(DEFAULT_TTS_CONFIG, currentSettings(s).tts);

const defaultAgent = (s: GlobalStore) => merge(DEFAULT_AGENT, currentSettings(s).defaultAgent);

const defaultAgentConfig = (s: GlobalStore) => merge(DEFAULT_AGENT_CONFIG, defaultAgent(s).config);

const defaultAgentMeta = (s: GlobalStore) => merge(DEFAULT_AGENT_META, defaultAgent(s).meta);

// TODO: Maybe we can also export settings difference
const exportSettings = (s: GlobalStore) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _, ...settings } = currentSettings(s);

  return settings as GlobalSettings;
};

const currentLanguage = (s: GlobalStore) => {
  const locale = currentSettings(s).language;

  if (locale === 'auto') {
    if (isOnServerSide) return DEFAULT_LANG;

    return navigator.language as Locales;
  }

  return locale;
};

const dalleConfig = (s: GlobalStore) => currentSettings(s).tool?.dalle || {};
const isDalleAutoGenerating = (s: GlobalStore) => currentSettings(s).tool?.dalle?.autoGenerate;

export const settingsSelectors = {
  currentLanguage,
  currentSettings,
  currentTTS,
  dalleConfig,
  defaultAgent,
  defaultAgentConfig,
  defaultAgentMeta,
  exportSettings,
  isDalleAutoGenerating,
  password,
};
