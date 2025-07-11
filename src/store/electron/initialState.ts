import {
  ClaudeCodeSessionInfo,
  DataSyncConfig,
  ElectronAppState,
} from '@lobechat/electron-client-ipc';

import { initialClaudeCodeState } from './claudeCode/initialState';

export type RemoteServerError = 'CONFIG_ERROR' | 'AUTH_ERROR' | 'DISCONNECT_ERROR';

// Claude Code 相关状态
export interface ClaudeCodeState {
  apiKeySource: string;
  error: string | null;
  isAvailable: boolean;
  isLoading: boolean;
  recentSessions: ClaudeCodeSessionInfo[];
  version: string;
}

export interface ElectronState {
  appState: ElectronAppState;
  claudeCode: ClaudeCodeState;
  dataSyncConfig: DataSyncConfig;
  isAppStateInit?: boolean;
  isConnectingServer?: boolean;
  isInitRemoteServerConfig: boolean;
  isSyncActive?: boolean;
  remoteServerSyncError?: { message?: string; type: RemoteServerError };
}

export const initialState: ElectronState = {
  appState: {},
  dataSyncConfig: { storageMode: 'local' },
  isAppStateInit: false,
  isConnectingServer: false,
  isInitRemoteServerConfig: false,
  isSyncActive: false,
  ...initialClaudeCodeState,
};
