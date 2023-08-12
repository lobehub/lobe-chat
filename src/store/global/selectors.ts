import { defaults } from 'lodash-es';

import { DEFAULT_AGENT_META } from '@/const/meta';
import { DEFAULT_AGENT, DEFAULT_AGENT_CONFIG, DEFAULT_SETTINGS } from '@/const/settings';
import { GlobalSettings } from '@/types/settings';

import { SettingsStore } from './store';

const currentSettings = (s: SettingsStore) => defaults(s.settings, DEFAULT_SETTINGS);

const currentDefaultAgent = (s: SettingsStore) => defaults(s.settings.defaultAgent, DEFAULT_AGENT);

const currentAgentConfig = (s: SettingsStore) =>
  defaults(s.settings.defaultAgent.config, DEFAULT_AGENT_CONFIG);

const currentAgentMeta = (s: SettingsStore) =>
  defaults(s.settings.defaultAgent.meta, DEFAULT_AGENT_META);

export const exportSettings = (s: SettingsStore) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { OPENAI_API_KEY: _, password: __, ...settings } = s.settings;

  return settings as GlobalSettings;
};

export const settingsSelectors = {
  currentAgentConfig,
  currentAgentMeta,
  currentDefaultAgent,
  currentSettings,
  exportSettings,
};
