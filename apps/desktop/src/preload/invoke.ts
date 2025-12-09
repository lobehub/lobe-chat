import { DispatchInvoke } from '@lobechat/electron-client-ipc';
import { ipcRenderer } from 'electron';

/**
 * Client-side method to invoke electron main process
 */
export const invoke: DispatchInvoke = async (event, ...data) => ipcRenderer.invoke(event, ...data);
