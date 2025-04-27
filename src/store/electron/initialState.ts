import { DataSyncConfig, ElectronAppState } from '@lobechat/electron-client-ipc';

export type RemoteServerError = 'CONFIG_ERROR' | 'AUTH_ERROR' | 'DISCONNECT_ERROR';

export interface ElectronState {
  appState: ElectronAppState;
  dataSyncConfig: DataSyncConfig;
  isConnectingServer?: boolean;
  isInitRemoteServerConfig: boolean;
  isSyncActive?: boolean;
  remoteServerSyncError?: { message?: string; type: RemoteServerError };
}

export const initialState: ElectronState = {
  appState: {},
  dataSyncConfig: { storageMode: 'local' },
  isConnectingServer: false,
  isInitRemoteServerConfig: false,
  isSyncActive: false,
};
