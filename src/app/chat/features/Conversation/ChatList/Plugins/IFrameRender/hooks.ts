import { useEffect } from 'react';

import { onPluginFetchMessage, onPluginReady } from './utils';

export const useOnPluginReady = (onReady: () => void) => {
  useEffect(() => {
    const fn = (e: MessageEvent) => {
      onPluginReady(e, onReady);
    };

    window.addEventListener('message', fn);
    return () => {
      window.removeEventListener('message', fn);
    };
  }, []);
};

export const useOnPluginFetchMessage = (onRequest: (data: any) => void, deps: any[] = []) => {
  useEffect(() => {
    const fn = (e: MessageEvent) => {
      onPluginFetchMessage(e, onRequest);
    };

    window.addEventListener('message', fn);
    return () => {
      window.removeEventListener('message', fn);
    };
  }, deps);
};
