import type { DispatchInvoke } from '@lobechat/electron-client-ipc';

export interface IElectronAPI {
  invoke: DispatchInvoke;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
