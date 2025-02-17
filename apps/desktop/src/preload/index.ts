import { electronAPI } from '@electron-toolkit/preload';
import { ClientDispatchEventKey, DispatchInvoke } from '@lobechat/electron-client-ipc';
import { contextBridge, ipcRenderer } from 'electron';

// Custom APIs for renderer
const api = {};

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

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.

try {
  contextBridge.exposeInMainWorld('api', api);
  contextBridge.exposeInMainWorld('electron', {
    ...electronAPI,
    ipcRenderer: ipcApi,
  });
} catch (error) {
  console.error(error);
}

/**
 * client 端请求 electron main 端方法
 */
const invoke: DispatchInvoke = async <T extends ClientDispatchEventKey>(event: T, ...data: any[]) =>
  ipcRenderer.invoke(event, ...data);

contextBridge.exposeInMainWorld('electronAPI', { invoke });
