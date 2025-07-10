import { DispatchInvoke } from './types';

interface IElectronAPI {
  invoke: DispatchInvoke;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}

/**
 * client 端请求 sketch 端 event 数据的方法
 */
export const dispatch: DispatchInvoke = async (event, ...data) => {
  if (!window.electronAPI || !window.electronAPI.invoke)
    throw new Error(`electronAPI.invoke not found. Please expose \`ipcRenderer.invoke\` to \`window.electronAPI.invoke\` in the preload:

import { contextBridge, ipcRenderer } from 'electron';

const invoke = async (event, ...data) =>
  ipcRenderer.invoke(event, ...data);

contextBridge.exposeInMainWorld('electronAPI', { invoke });
`);

  return window.electronAPI.invoke(event, ...data);
};
