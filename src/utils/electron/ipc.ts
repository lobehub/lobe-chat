import { getElectronIpc } from '@lobechat/electron-client-ipc';
import type { DesktopIpcServices } from '@lobehub/desktop-ipc-typings';

export const ensureElectronIpc = (): DesktopIpcServices => {
  const ipc = getElectronIpc();
  if (!ipc) {
    throw new Error(
      'electronAPI.ipc not found. Please ensure the desktop preload exposes IPC services via window.electronAPI.ipc',
    );
  }
  return ipc as DesktopIpcServices;
};
