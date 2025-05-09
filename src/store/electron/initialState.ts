import { DataSyncConfig, ElectronAppState } from '@lobechat/electron-client-ipc';

export type RemoteServerError = 'CONFIG_ERROR' | 'AUTH_ERROR' | 'DISCONNECT_ERROR';

export interface ElectronState {
  appState: ElectronAppState;
  dataSyncConfig: DataSyncConfig;
  isAppStateInit: boolean;
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
};
