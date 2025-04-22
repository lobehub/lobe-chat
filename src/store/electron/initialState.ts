import { ElectronAppState, RemoteServerConfig } from '@lobechat/electron-client-ipc';

export type RemoteServerError = 'CONFIG_ERROR' | 'AUTH_ERROR' | 'DISCONNECT_ERROR';

export interface ElectronState {
  appState: ElectronAppState;
  isConnectingServer?: boolean;
  isInitRemoteServerConfig: boolean;
  isSyncActive?: boolean;
  remoteServerConfig: RemoteServerConfig;
  remoteServerSyncError?: { message?: string; type: RemoteServerError };
}

export const initialState: ElectronState = {
  appState: {},
  isConnectingServer: false,
  isInitRemoteServerConfig: false,
  isSyncActive: false,
  remoteServerConfig: { active: false, isSelfHosted: false },
};
