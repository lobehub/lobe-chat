import { electronAPI } from '@electron-toolkit/preload';
import { contextBridge, ipcRenderer } from 'electron';

import { invoke } from './invoke';

// 添加 IPC 通信接口
const ipcApi = {
  receive: (channel: string, callback: (...args: any[]) => void) => {
    // 包装回调函数，确保安全性
    const subscription = (_event: any, ...args: any[]) => callback(...args);
    ipcRenderer.on(channel, subscription);

    // 返回取消订阅的函数
    return () => {
      ipcRenderer.removeListener(channel, subscription);
    };
  },
  send: (channel: string, ...args: any[]) => {
    console.log('channel', channel);
    ipcRenderer.send(channel, ...args);
  },
};

export const setupElectronApi = () => {
  // Use `contextBridge` APIs to expose Electron APIs to
  // renderer only if context isolation is enabled, otherwise
  // just add to the DOM global.

  try {
    contextBridge.exposeInMainWorld('electron', {
      ...electronAPI,
      ipcRenderer: ipcApi,
    });
  } catch (error) {
    console.error(error);
  }

  contextBridge.exposeInMainWorld('electronAPI', { invoke });
};
