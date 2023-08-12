import { merge } from 'lodash-es';

import { DEFAULT_AGENT_META } from '@/const/meta';
import { DEFAULT_AGENT, DEFAULT_AGENT_CONFIG, DEFAULT_SETTINGS } from '@/const/settings';
import { GlobalSettings } from '@/types/settings';

import { GlobalStore } from './store';

const currentSettings = (s: GlobalStore) => merge({}, DEFAULT_SETTINGS, s.settings);

const currentDefaultAgent = (s: GlobalStore) => merge({}, DEFAULT_AGENT, s.settings.defaultAgent);

const currentAgentConfig = (s: GlobalStore) =>
  merge({}, DEFAULT_AGENT_CONFIG, s.settings.defaultAgent.config);

const currentAgentMeta = (s: GlobalStore) =>
  merge({}, DEFAULT_AGENT_META, s.settings.defaultAgent.meta);

export const exportSettings = (s: GlobalStore) => {
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
