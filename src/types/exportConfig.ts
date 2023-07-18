import type { NeutralColors, PrimaryColors } from '@lobehub/ui';
import { ThemeMode } from 'antd-style';

import { Locales } from './locale';

/**
 * 配置设置
 */
export interface ConfigSettings {
  accessCode: string;
  avatar: string;
  compressThreshold: number;
  enableCompressThreshold: boolean;
  enableHistoryCount: boolean;
  enableMaxTokens: boolean;
  endpoint: string;
  fontSize: number;
  frequencyPenalty: number;
  historyCount: number;
  language: Locales;
  maxTokens: number;
  model: string;
  neutralColor: NeutralColors | '';
  presencePenalty: number;
  primaryColor: PrimaryColors | '';
  temperature: number;
  themeMode: ThemeMode;
  token: string;
  topP: number;
}

export type ConfigKeys = keyof ConfigSettings;

export interface ConfigState {
  settings: ConfigSettings;
}

export interface ConfigFile {
  state: ConfigState;
  /**
   * 配置文件的版本号
   */
  version: number;
}
