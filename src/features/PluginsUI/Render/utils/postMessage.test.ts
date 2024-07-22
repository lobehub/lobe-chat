import { PluginChannel } from '@lobehub/chat-plugin-sdk/client';
import { describe, expect, it, vi } from 'vitest';

import {
  sendMessageContentToPlugin,
  sendPayloadToPlugin,
  sendPluginSettingsToPlugin,
  sendPluginStateToPlugin,
} from './postMessage';

// Mock window object with a postMessage spy
const mockWindow = {
  postMessage: vi.fn(),
};

describe('plugin communication functions', () => {
  it('sendMessageContentToPlugin should call window.postMessage with correct arguments', () => {
    const props = { some: 'data' };
    sendMessageContentToPlugin(mockWindow as unknown as Window, props);
    expect(mockWindow.postMessage).toHaveBeenCalledWith(
      { props, type: PluginChannel.renderPlugin },
      '*',
    );
  });

  it('sendPayloadToPlugin should call window.postMessage with correct arguments', () => {
    const props = { payload: 'payload', settings: 'settings', state: 'state' };
    sendPayloadToPlugin(mockWindow as unknown as Window, props);
    expect(mockWindow.postMessage).toHaveBeenCalledWith(
      {
        type: PluginChannel.initStandalonePlugin,
        payload: props.payload,
        settings: props.settings,
        state: props.state,
        props: props.payload, // Note: This is due to the TODO in your code
      },
      '*',
    );
  });

  it('sendPluginStateToPlugin should call window.postMessage with correct arguments', () => {
    const key = 'key';
    const value = 'value';
    sendPluginStateToPlugin(mockWindow as unknown as Window, key, value);
    expect(mockWindow.postMessage).toHaveBeenCalledWith(
      { key, type: PluginChannel.renderPluginState, value },
      '*',
    );
  });

  it('sendPluginSettingsToPlugin should call window.postMessage with correct arguments', () => {
    const settings = { setting1: 'value1' };
    sendPluginSettingsToPlugin(mockWindow as unknown as Window, settings);
    expect(mockWindow.postMessage).toHaveBeenCalledWith(
      { type: PluginChannel.renderPluginSettings, value: settings },
      '*',
    );
  });
});

// Reset the mock after each test
afterEach(() => {
  vi.resetAllMocks();
});
