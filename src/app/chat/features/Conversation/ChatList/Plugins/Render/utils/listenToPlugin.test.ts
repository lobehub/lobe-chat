import { PluginChannel } from '@lobehub/chat-plugin-sdk/client';
import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  useOnPluginFetchMessage,
  useOnPluginFetchPluginSettings,
  useOnPluginFetchPluginState,
  useOnPluginFillContent,
} from './listenToPlugin';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useOnPluginFetchMessage', () => {
  it('calls onRequest when a fetchPluginMessage is received', () => {
    const mockOnRequest = vi.fn();
    renderHook(() => useOnPluginFetchMessage(mockOnRequest));

    const testData = { key: 'testData', type: PluginChannel.fetchPluginMessage };
    const event = new MessageEvent('message', {
      data: testData,
    });

    window.dispatchEvent(event);

    expect(mockOnRequest).toHaveBeenCalledWith(testData);
  });

  it('does not call onRequest for other message types', () => {
    const mockOnRequest = vi.fn();
    renderHook(() => useOnPluginFetchMessage(mockOnRequest));

    const event = new MessageEvent('message', {
      data: { type: 'otherMessageType' },
    });

    window.dispatchEvent(event);

    expect(mockOnRequest).not.toHaveBeenCalled();
  });
});

describe('useOnPluginFetchPluginState', () => {
  it('calls onRequest with the key when a fetchPluginState message is received', () => {
    const mockOnRequest = vi.fn();
    renderHook(() => useOnPluginFetchPluginState(mockOnRequest));

    const testKey = 'testKey';
    const event = new MessageEvent('message', {
      data: { type: PluginChannel.fetchPluginState, key: testKey },
    });

    window.dispatchEvent(event);

    expect(mockOnRequest).toHaveBeenCalledWith(testKey);
  });
});

describe('useOnPluginFillContent', () => {
  it('calls callback with content when a fillStandalonePluginContent message is received', () => {
    const mockCallback = vi.fn();
    renderHook(() => useOnPluginFillContent(mockCallback));

    const testContent = 'testContent';
    const event = new MessageEvent('message', {
      data: { type: PluginChannel.fillStandalonePluginContent, content: testContent },
    });

    window.dispatchEvent(event);

    expect(mockCallback).toHaveBeenCalledWith(testContent);
  });

  it('calls callback with JSON stringified content if content is not a string', () => {
    const mockCallback = vi.fn();
    renderHook(() => useOnPluginFillContent(mockCallback));

    const testContent = { some: 'data' };
    const event = new MessageEvent('message', {
      data: { type: PluginChannel.fillStandalonePluginContent, content: testContent },
    });

    window.dispatchEvent(event);

    expect(mockCallback).toHaveBeenCalledWith(JSON.stringify(testContent));
  });
});

describe('useOnPluginFetchPluginSettings', () => {
  it('calls onRequest when a fetchPluginSettings message is received', () => {
    const mockOnRequest = vi.fn();
    renderHook(() => useOnPluginFetchPluginSettings(mockOnRequest));

    const event = new MessageEvent('message', {
      data: { type: PluginChannel.fetchPluginSettings },
    });

    window.dispatchEvent(event);

    expect(mockOnRequest).toHaveBeenCalled();
  });
});
