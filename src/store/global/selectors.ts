import { DEFAULT_AGENT_META } from '@/const/meta';
import { DEFAULT_AGENT, DEFAULT_AGENT_CONFIG, DEFAULT_SETTINGS } from '@/const/settings';
import { GlobalSettings } from '@/types/settings';
import { merge } from '@/utils/merge';

import { GlobalStore } from './store';

const currentSettings = (s: GlobalStore) => merge(DEFAULT_SETTINGS, s.settings);

const defaultAgent = (s: GlobalStore) => merge(DEFAULT_AGENT, s.settings.defaultAgent);

const defaultAgentConfig = (s: GlobalStore) => merge(DEFAULT_AGENT_CONFIG, defaultAgent(s).config);

const defaultAgentMeta = (s: GlobalStore) => merge(DEFAULT_AGENT_META, defaultAgent(s).meta);

export const exportSettings = (s: GlobalStore) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { OPENAI_API_KEY: _, password: __, ...settings } = s.settings;

  return settings as GlobalSettings;
};

export const globalSelectors = {
  currentSettings,
  defaultAgent,
  defaultAgentConfig,
  defaultAgentMeta,
  exportSettings,
};
