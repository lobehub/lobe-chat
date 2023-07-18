import type { NeutralColors, PrimaryColors } from '@lobehub/ui';
import { ThemeMode } from 'antd-style';

import { Locales } from './locale';

/**
 * 配置设置
 */
export interface ConfigSettings {
  avatar?: string;
  fontSize: number;
  language: Locales;
  neutralColor?: NeutralColors | '';
  primaryColor?: PrimaryColors | '';
  themeMode: ThemeMode;
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
