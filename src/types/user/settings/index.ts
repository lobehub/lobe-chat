import type { NeutralColors, PrimaryColors } from '@lobehub/ui';
import type { ThemeMode } from 'antd-style';

import { LocaleMode } from '@/types/locale';
import type { LobeAgentSession } from '@/types/session';

import { GlobalLLMConfig } from './modelProvider';
import { GlobalSyncSettings } from './sync';
import { GlobalSystemAgentConfig } from './systemAgent';
import { GlobalTTSConfig } from './tts';

export type GlobalDefaultAgent = Pick<LobeAgentSession, 'config' | 'meta'>;

export * from './general';
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
export interface UserSettings {
  defaultAgent: GlobalDefaultAgent;
  /**
   * @deprecated
   */
  fontSize: number;
  /**
   * @deprecated
   */
  language: LocaleMode;
  languageModel: GlobalLLMConfig;
  /**
   * @deprecated
   */
  neutralColor?: NeutralColors;

  password: string;

  /**
   * @deprecated
   */
  primaryColor?: PrimaryColors;
  sync: GlobalSyncSettings;
  systemAgent: GlobalSystemAgentConfig;
  /**
   * @deprecated
   */
  themeMode: ThemeMode;
  tool: GlobalTool;
  tts: GlobalTTSConfig;
}
