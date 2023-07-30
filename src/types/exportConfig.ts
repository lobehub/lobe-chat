import { LobeSessions } from '@/types/session';
import { GlobalSettings } from '@/types/settings';

export interface ConfigState {
  sessions: LobeSessions;
  settings: GlobalSettings;
}

export interface ConfigFile {
  state: ConfigState;
  /**
   * 配置文件的版本号
   */
  version: number;
}
