'use client';

import { useEffect } from 'react';

import { MainBroadcastEventKey, MainBroadcastParams } from './events';

interface ElectronAPI {
  ipcRenderer: {
    on: (event: MainBroadcastEventKey, listener: (e: any, data: any) => void) => void;
    removeListener: (event: MainBroadcastEventKey, listener: (e: any, data: any) => void) => void;
  };
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export const useWatchBroadcast = <T extends MainBroadcastEventKey>(
  event: T,
  handler: (data: MainBroadcastParams<T>) => void,
) => {
  useEffect(() => {
    if (!window.electron) return;

    const listener = (e: any, data: MainBroadcastParams<T>) => {
      handler(data);
    };

    window.electron.ipcRenderer.on(event, listener);

    return () => {
      window.electron.ipcRenderer.removeListener(event, listener);
    };
  }, []);
};
