import { ClientDispatchEventKey, DispatchInvoke } from '@lobechat/electron-client-ipc';
import { ipcRenderer } from 'electron';

/**
 * client 端请求 electron main 端方法
 */
export const invoke: DispatchInvoke = async <T extends ClientDispatchEventKey>(
  event: T,
  ...data: any[]
) => ipcRenderer.invoke(event, ...data);
