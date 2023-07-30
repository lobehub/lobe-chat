import { LobeSessions } from '@/types/session';
import { GlobalSettings } from '@/types/settings';

export interface ConfigState {
  sessions: LobeSessions;
  settings: GlobalSettings;
}

export interface SettingsConfigState {
  settings: GlobalSettings;
}
export interface SessionsConfigState {
  sessions: LobeSessions;
}

export type ExportType = 'agents' | 'sessions' | 'settings' | 'all';

export type ConfigFile = ConfigFileSettings | ConfigFileSessions | ConfigFileAll | ConfigFileAgents;

export interface ConfigFileSettings {
  exportType: 'settings';
  state: SettingsConfigState;
  version: number;
}
export interface ConfigFileSessions {
  exportType: 'sessions';
  state: SessionsConfigState;
  version: number;
}

export interface ConfigFileAgents {
  exportType: 'agents';
  state: SessionsConfigState;
  version: number;
}

export interface ConfigFileAll {
  exportType: 'all';
  state: ConfigState;
  version: number;
}
