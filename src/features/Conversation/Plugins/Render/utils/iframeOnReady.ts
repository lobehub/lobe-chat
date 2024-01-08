import { PluginChannel } from '@lobehub/chat-plugin-sdk/client';
import { useEffect, useState } from 'react';

export const useOnPluginReadyForInteraction = (onReady: () => void, deps: any[] = []) => {
  const [readyForRender, setReady] = useState(false);
  useEffect(() => {
    const fn = (e: MessageEvent) => {
      if (e.data.type === PluginChannel.pluginReadyForRender) {
        setReady(true);
      }
    };

    window.addEventListener('message', fn);
    return () => {
      window.removeEventListener('message', fn);
    };
  }, []);
  useEffect(() => {
    if (readyForRender) {
      onReady();
    }
  }, [readyForRender, ...deps]);

  return readyForRender;
};
