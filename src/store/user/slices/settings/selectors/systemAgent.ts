import { DEFAULT_SYSTEM_AGENT_CONFIG } from '@/const/settings';
import type { UserStore } from '@/store/user';
import { merge } from '@/utils/merge';

import { currentSettings } from './settings';

const currentSystemAgent = (s: UserStore) =>
  merge(DEFAULT_SYSTEM_AGENT_CONFIG, currentSettings(s).systemAgent);

const translation = (s: UserStore) => currentSystemAgent(s).translation;
const topic = (s: UserStore) => currentSystemAgent(s).topic;

export const systemAgentSelectors = {
  topic,
  translation,
};
