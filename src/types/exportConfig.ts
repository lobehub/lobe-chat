/**
 * 配置设置
 */
export interface ConfigSettings {
  /**
   * 头像链接
   */
  avatar?: string;
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
