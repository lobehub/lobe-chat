import { DataSyncConfig, ElectronAppState, NetworkProxySettings } from '@lobechat/electron-client-ipc';

export type RemoteServerError = 'CONFIG_ERROR' | 'AUTH_ERROR' | 'DISCONNECT_ERROR';

export const defaultProxySettings: NetworkProxySettings = {
  enableProxy: false,
  proxyBypass: 'localhost, 127.0.0.1, ::1',
  proxyPort: '',
  proxyRequireAuth: false,
  proxyServer: '',
  proxyType: 'http',
};

export interface ElectronState {
  appState: ElectronAppState;
  dataSyncConfig: DataSyncConfig;
  isAppStateInit?: boolean;
  isConnectingServer?: boolean;
  isInitRemoteServerConfig: boolean;
  isSyncActive?: boolean;
  proxySettings: NetworkProxySettings;
  remoteServerSyncError?: { message?: string; type: RemoteServerError };
}

export const initialState: ElectronState = {
  appState: {},
  dataSyncConfig: { storageMode: 'local' },
  isAppStateInit: false,
  isConnectingServer: false,
  isInitRemoteServerConfig: false,
  isSyncActive: false,
  proxySettings: defaultProxySettings,
};
