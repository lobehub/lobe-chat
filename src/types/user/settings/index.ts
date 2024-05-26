import type { NeutralColors, PrimaryColors } from '@lobehub/ui';
import type { ThemeMode } from 'antd-style';

import { LocaleMode } from '@/types/locale';
import type { LobeAgentSession } from '@/types/session';

import { UserModelProviderConfig } from './modelProvider';
import { UserSyncSettings } from './sync';
import { UserSystemAgentConfig } from './systemAgent';
import { UserToolConfig } from './tool';
import { UserTTSConfig } from './tts';

export type UserDefaultAgent = Pick<LobeAgentSession, 'config' | 'meta'>;

export * from './general';
export * from './modelProvider';
export * from './sync';
export * from './systemAgent';
export * from './tts';

/**
 * 配置设置
 */
export interface UserSettings {
  defaultAgent: UserDefaultAgent;
  /**
   * @deprecated
   */
  fontSize: number;
  /**
   * @deprecated
   */
  language: LocaleMode;
  languageModel: UserModelProviderConfig;
  /**
   * @deprecated
   */
  neutralColor?: NeutralColors;

  password: string;

  /**
   * @deprecated
   */
  primaryColor?: PrimaryColors;
  sync: UserSyncSettings;
  systemAgent: UserSystemAgentConfig;
  /**
   * @deprecated
   */
  themeMode: ThemeMode;
  tool: UserToolConfig;
  tts: UserTTSConfig;
}
