import { DEFAULT_AGENT_META } from '@/const/meta';
import {
  DEFAULT_AGENT,
  DEFAULT_AGENT_CONFIG,
  DEFAULT_SYSTEM_AGENT_CONFIG,
  DEFAULT_TTS_CONFIG,
} from '@/const/settings';
import {
  GlobalLLMProviderKey,
  ProviderConfig,
  UserSettings,
} from '@/types/user/settings';
import { merge } from '@/utils/merge';

import { UserStore } from '../../../store';

export const currentSettings = (s: UserStore): UserSettings => merge(s.defaultSettings, s.settings);

export const currentLLMSettings = (s: UserStore) => currentSettings(s).languageModel;

export const getProviderConfigById = (provider: string) => (s: UserStore) =>
  currentLLMSettings(s)[provider as GlobalLLMProviderKey] as
    | ProviderConfig
    | undefined;

const password = (s: UserStore) => currentSettings(s).keyVaults.password || '';

const currentTTS = (s: UserStore) => merge(DEFAULT_TTS_CONFIG, currentSettings(s).tts);

const defaultAgent = (s: UserStore) => merge(DEFAULT_AGENT, currentSettings(s).defaultAgent);
const defaultAgentConfig = (s: UserStore) => merge(DEFAULT_AGENT_CONFIG, defaultAgent(s).config);

const defaultAgentMeta = (s: UserStore) => merge(DEFAULT_AGENT_META, defaultAgent(s).meta);

const exportSettings = currentSettings;

const dalleConfig = (s: UserStore) => currentSettings(s).tool?.dalle || {};
const isDalleAutoGenerating = (s: UserStore) => currentSettings(s).tool?.dalle?.autoGenerate;

const currentSystemAgent = (s: UserStore) =>
  merge(DEFAULT_SYSTEM_AGENT_CONFIG, currentSettings(s).systemAgent);

export const settingsSelectors = {
  currentSettings,
  currentSystemAgent,
  currentTTS,
  dalleConfig,
  defaultAgent,
  defaultAgentConfig,
  defaultAgentMeta,
  exportSettings,
  isDalleAutoGenerating,
  password,
  providerConfig: getProviderConfigById,
};
