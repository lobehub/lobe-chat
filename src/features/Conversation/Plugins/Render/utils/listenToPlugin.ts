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

export const useOnPluginFillContent = (
  callback: (content: string, triggerAiMessage?: boolean) => void,
) => {
  useEffect(() => {
    const fn = (e: MessageEvent) => {
      if (e.data.type === PluginChannel.fillStandalonePluginContent) {
        const data = e.data.content;
        const triggerAiMessage = e.data.triggerAiMessage;
        const content = typeof data !== 'string' ? JSON.stringify(data) : data;

        callback(content, triggerAiMessage);
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

export const useOnPluginTriggerAIMessage = (callback: (id: string) => void) => {
  useEffect(() => {
    const fn = (e: MessageEvent) => {
      if (e.data.type === PluginChannel.triggerAIMessage) {
        callback(e.data.id);
      }
    };

    window.addEventListener('message', fn);
    return () => {
      window.removeEventListener('message', fn);
    };
  }, []);
};

export const useOnPluginCreateAssistantMessage = (callback: (content: string) => void) => {
  useEffect(() => {
    const fn = (e: MessageEvent) => {
      if (e.data.type === PluginChannel.createAssistantMessage) {
        callback(e.data.content);
      }
    };

    window.addEventListener('message', fn);
    return () => {
      window.removeEventListener('message', fn);
    };
  }, []);
};
