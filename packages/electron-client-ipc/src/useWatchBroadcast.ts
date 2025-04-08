import { useEffect } from 'react';

import { MainBroadcastEventKey, MainBroadcastParams } from './events';

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
