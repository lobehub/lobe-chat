import { PluginChannel } from '@lobehub/chat-plugin-sdk/client';

export const onPluginReady = (e: MessageEvent, onReady: () => void) => {
  if (e.data.type === PluginChannel.pluginReadyForRender) {
    onReady();
  }
};

export const onPluginFetchMessage = (e: MessageEvent, onRequest: (data: any) => void) => {
  if (e.data.type === PluginChannel.fetchPluginMessage) {
    onRequest(e.data);
  }
};

export const sendMessageToPlugin = (window: Window, props: any) => {
  window.postMessage({ props, type: PluginChannel.renderPlugin }, '*');
};
