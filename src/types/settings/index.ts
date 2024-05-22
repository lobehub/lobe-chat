import type { LobeAgentSession } from '@/types/session';

import { GlobalBaseSettings } from './base';
import { GlobalLLMConfig } from './modelProvider';
import { GlobalSyncSettings } from './sync';
import { GlobalSystemAgentConfig } from './systemAgent';
import { GlobalTTSConfig } from './tts';

export type GlobalDefaultAgent = Pick<LobeAgentSession, 'config' | 'meta'>;

export * from './base';
export * from './modelProvider';
export * from './sync';
export * from './systemAgent';
export * from './tts';

export interface GlobalTool {
  dalle: {
    autoGenerate: boolean;
  };
}

/**
 * 配置设置
 */
export interface GlobalSettings extends GlobalBaseSettings {
  defaultAgent: GlobalDefaultAgent;
  languageModel: GlobalLLMConfig;
  sync: GlobalSyncSettings;
  systemAgent: GlobalSystemAgentConfig;
  tool: GlobalTool;
  tts: GlobalTTSConfig;
}
