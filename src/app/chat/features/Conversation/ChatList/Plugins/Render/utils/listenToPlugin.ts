import { PluginChannel } from '@lobehub/chat-plugin-sdk/client';
import { useEffect } from 'react';

export const useOnPluginFetchMessage = (onRequest: (data: any) => void, deps: any[] = []) => {
  useEffect(() => {
    const fn = (e: MessageEvent) => {
      if (e.data.type === PluginChannel.fetchPluginMessage) {
        onRequest(e.data);
      }
    };

    window.addEventListener('message', fn);
    return () => {
      window.removeEventListener('message', fn);
    };
  }, deps);
};

export const useOnPluginFetchPluginState = (onRequest: (key: string) => void) => {
  useEffect(() => {
    const fn = (e: MessageEvent) => {
      if (e.data.type === PluginChannel.fetchPluginState) {
        onRequest(e.data.key);
      }
    };

    window.addEventListener('message', fn);
    return () => {
      window.removeEventListener('message', fn);
    };
  }, []);
};

export const useOnPluginFillContent = (callback: (content: string) => void) => {
  useEffect(() => {
    const fn = (e: MessageEvent) => {
      if (e.data.type === PluginChannel.fillStandalonePluginContent) {
        const data = e.data.content;
        const content = typeof data !== 'string' ? JSON.stringify(data) : data;

        callback(content);
      }
    };

    window.addEventListener('message', fn);
    return () => {
      window.removeEventListener('message', fn);
    };
  }, []);
};

export const useOnPluginFetchPluginSettings = (onRequest: () => void) => {
  useEffect(() => {
    const fn = (e: MessageEvent) => {
      if (e.data.type === PluginChannel.fetchPluginSettings) {
        onRequest();
      }
    };

    window.addEventListener('message', fn);
    return () => {
      window.removeEventListener('message', fn);
    };
  }, []);
};
