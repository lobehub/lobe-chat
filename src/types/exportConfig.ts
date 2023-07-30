import { LobeSessions } from '@/types/session';
import { GlobalSettings } from '@/types/settings';

// 存在4种导出方式
export type ExportType = 'agents' | 'sessions' | 'settings' | 'all';

// 4种方式对应的 state
export interface ConfigStateAll {
  sessions: LobeSessions;
  settings: GlobalSettings;
}
export interface ConfigStateSettings {
  settings: GlobalSettings;
}
export interface ConfigStateSessions {
  sessions: LobeSessions;
}

// 4种方式对应的 file
export interface ConfigFileSettings {
  exportType: 'settings';
  state: ConfigStateSettings;
  version: number;
}
export interface ConfigFileSessions {
  exportType: 'sessions';
  state: ConfigStateSessions;
  version: number;
}
export interface ConfigFileAgents {
  exportType: 'agents';
  state: ConfigStateSessions;
  version: number;
}
export interface ConfigFileAll {
  exportType: 'all';
  state: ConfigStateAll;
  version: number;
}

export type ConfigFile = ConfigFileSettings | ConfigFileSessions | ConfigFileAll | ConfigFileAgents;

// 用于 map 收集类型的 map
export interface ConfigModelMap {
  agents: {
    file: ConfigFileAgents;
    state: ConfigStateSessions;
  };
  all: {
    file: ConfigFileAll;
    state: ConfigStateAll;
  };
  sessions: {
    file: ConfigFileSessions;
    state: ConfigStateSessions;
  };
  settings: {
    file: ConfigFileSettings;
    state: ConfigStateSettings;
  };
}
