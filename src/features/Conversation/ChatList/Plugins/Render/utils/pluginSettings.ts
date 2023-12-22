import { PluginChannel } from '@lobehub/chat-plugin-sdk/client';
import { useEffect } from 'react';

export const useOnPluginSettingsUpdate = (callback: (settings: any) => void) => {
  useEffect(() => {
    const fn = (e: MessageEvent) => {
      if (e.data.type === PluginChannel.updatePluginSettings) {
        callback(e.data.value);
      }
    };

    window.addEventListener('message', fn);
    return () => {
      window.removeEventListener('message', fn);
    };
  }, []);
};
