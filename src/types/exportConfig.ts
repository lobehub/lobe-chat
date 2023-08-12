import { LobeAgentSession, LobeSessions } from '@/types/session';
import { GlobalSettings } from '@/types/settings';

// 存在4种导出方式
export type ExportType = 'agents' | 'sessions' | 'singleSession' | 'settings' | 'all';

// 4种方式对应的 state

export interface ConfigStateSettings {
  settings: GlobalSettings;
}

export interface ConfigStateAgents {
  sessions: LobeSessions;
}

export interface ConfigStateSessions {
  inbox: LobeAgentSession;
  sessions: LobeSessions;
}

export interface ConfigStateSingleSession {
  sessions: LobeSessions;
}

export interface ConfigStateAll extends ConfigStateSessions, ConfigStateSettings {}

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

export interface ConfigFileSingleSession {
  exportType: 'sessions';
  state: ConfigStateSingleSession;
  version: number;
}

export interface ConfigFileAgents {
  exportType: 'agents';
  state: ConfigStateAgents;
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
    state: ConfigStateAgents;
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
  singleSession: {
    file: ConfigFileSingleSession;
    state: ConfigStateSingleSession;
  };
}
