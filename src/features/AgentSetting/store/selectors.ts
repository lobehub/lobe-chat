import { DEFAULT_AGENT_META } from '@/const/meta';
import {
  DEFAULT_AGENT_CHAT_CONFIG,
  DEFAULT_AGENT_CONFIG,
  DEFAUTT_AGENT_TTS_CONFIG,
} from '@/const/settings';
import { merge } from '@/utils/merge';

import { Store } from './action';

const currentAgentConfig = (s: Store) => merge(DEFAULT_AGENT_CONFIG, s.config);

const currentChatConfig = (s: Store) => merge(DEFAULT_AGENT_CHAT_CONFIG, s.config.chatConfig);

const currentMetaConfig = (s: Store) => merge(DEFAULT_AGENT_META, s.meta);

const currentTtsConfig = (s: Store) => merge(DEFAUTT_AGENT_TTS_CONFIG, s.config.tts);

export const selectors = {
  currentAgentConfig,
  currentChatConfig,
  currentMetaConfig,
  currentTtsConfig,
};
