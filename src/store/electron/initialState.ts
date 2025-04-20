import { RemoteServerConfig } from '@lobechat/electron-client-ipc';

export type RemoteServerError = 'CONFIG_ERROR' | 'AUTH_ERROR' | 'DISCONNECT_ERROR';

export interface ElectronState {
  isConnectingServer?: boolean;
  isInitRemoteServerConfig: boolean;
  isSyncActive?: boolean;
  remoteServerConfig: RemoteServerConfig;
  remoteServerSyncError?: { message?: string; type: RemoteServerError };
}

export const initialState: ElectronState = {
  isConnectingServer: false,
  isInitRemoteServerConfig: false,
  isSyncActive: false,
  remoteServerConfig: { active: false, isSelfHosted: false },
};
