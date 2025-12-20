import { UserSettings } from '@lobechat/types';

import { DEFAULT_AGENT } from './agent';
import { DEFAULT_COMMON_SETTINGS } from './common';
import { DEFAULT_HOTKEY_CONFIG } from './hotkey';
import { DEFAULT_IMAGE_CONFIG } from './image';
import { DEFAULT_LLM_CONFIG } from './llm';
import { DEFAULT_MEMORY_SETTINGS } from './memory';
import { DEFAULT_SYSTEM_AGENT_CONFIG } from './systemAgent';
import { DEFAULT_TOOL_CONFIG } from './tool';
import { DEFAULT_TTS_CONFIG } from './tts';

export * from './agent';
export * from './common';
export * from './group';
export * from './hotkey';
export * from './image';
export * from './knowledge';
export * from './llm';
export * from './memory';
export * from './systemAgent';
export * from './tool';
export * from './tts';

export const DEFAULT_SETTINGS: UserSettings = {
  defaultAgent: DEFAULT_AGENT,
  general: DEFAULT_COMMON_SETTINGS,
  hotkey: DEFAULT_HOTKEY_CONFIG,
  image: DEFAULT_IMAGE_CONFIG,
  keyVaults: {},
  languageModel: DEFAULT_LLM_CONFIG,
  memory: DEFAULT_MEMORY_SETTINGS,
  systemAgent: DEFAULT_SYSTEM_AGENT_CONFIG,
  tool: DEFAULT_TOOL_CONFIG,
  tts: DEFAULT_TTS_CONFIG,
};
