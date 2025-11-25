import { ClientDispatchEventKey, DispatchInvoke } from '@lobechat/electron-client-ipc';
import { ipcRenderer } from 'electron';

/**
 * Client-side method to invoke electron main process
 */
export const invoke: DispatchInvoke = async <T extends ClientDispatchEventKey>(
  event: T,
  ...data: any[]
) => ipcRenderer.invoke(event, ...data);
