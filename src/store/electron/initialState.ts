import { DataSyncConfig, ElectronAppState, ClaudeCodeSessionInfo } from '@lobehub/electron-client-ipc';

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
  claudeCode: {
    apiKeySource: '',
    error: null,
    isAvailable: false,
    isLoading: false,
    recentSessions: [],
    version: '',
  },
  dataSyncConfig: { storageMode: 'local' },
  isAppStateInit: false,
  isConnectingServer: false,
  isInitRemoteServerConfig: false,
  isSyncActive: false,
};
