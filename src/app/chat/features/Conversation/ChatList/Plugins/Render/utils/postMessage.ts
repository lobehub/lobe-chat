import { PluginChannel } from '@lobehub/chat-plugin-sdk/client';

export const sendMessageContentToPlugin = (window: Window, props: any) => {
  window.postMessage({ props, type: PluginChannel.renderPlugin }, '*');
};

export const sendPayloadToPlugin = (
  window: Window,
  props: { payload: any; settings: any; state?: any },
) => {
  window.postMessage(
    {
      type: PluginChannel.initStandalonePlugin,
      ...props,
      // TODO: props need to deprecated
      props: props.payload,
    },
    '*',
  );
};

export const sendPluginStateToPlugin = (window: Window, key: string, value: any) => {
  window.postMessage({ key, type: PluginChannel.renderPluginState, value }, '*');
};

export const sendPluginSettingsToPlugin = (window: Window, settings: any) => {
  window.postMessage({ type: PluginChannel.renderPluginSettings, value: settings }, '*');
};
