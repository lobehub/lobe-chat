import type * as ElectronClientIpc from '@lobechat/electron-client-ipc';
import type { OpenPortStreamOptions } from '@lobechat/electron-client-ipc';
import { HETERO_SESSION_PORT_STREAM } from '@lobechat/electron-client-ipc';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { subscribeHeteroSession } from './sessionSubscription';

const { mockOpenPortStream } = vi.hoisted(() => ({ mockOpenPortStream: vi.fn() }));

vi.mock('@lobechat/electron-client-ipc', async (importOriginal) => ({
  ...(await importOriginal<typeof ElectronClientIpc>()),
  openPortStream: mockOpenPortStream,
}));

describe('subscribeHeteroSession', () => {
  const listeners = new Map<string, (event: unknown, data: any) => void>();
  const ipcOn = vi.fn((channel: string, listener: (event: unknown, data: any) => void) => {
    listeners.set(channel, listener);
    return () => listeners.delete(channel);
  });
  const callbacks = { onComplete: vi.fn(), onError: vi.fn(), onStreamEvent: vi.fn() };
  let originalElectron: unknown;

  beforeEach(() => {
    vi.clearAllMocks();
    listeners.clear();
    originalElectron = (window as any).electron;
    (window as any).electron = { ipcRenderer: { on: ipcOn } };
  });

  afterEach(() => {
    (window as any).electron = originalElectron;
  });

  describe('over the session port stream', () => {
    let options: OpenPortStreamOptions<any>;
    const close = vi.fn();
    const sync = vi.fn(async () => {});

    beforeEach(() => {
      mockOpenPortStream.mockImplementation((opts) => {
        options = opts;
        return { close, sync };
      });
    });

    it('syncs through the port stream', async () => {
      await subscribeHeteroSession('s1', callbacks).sync();

      expect(sync).toHaveBeenCalledOnce();
    });

    it('opens the session stream and leaves the broadcasts alone', () => {
      subscribeHeteroSession('s1', callbacks);

      expect(options).toMatchObject({ key: 's1', name: HETERO_SESSION_PORT_STREAM });
      expect(ipcOn).not.toHaveBeenCalled();
    });

    it('dispatches events, completion and errors in stream order', () => {
      const order: string[] = [];
      callbacks.onStreamEvent.mockImplementation(() => order.push('event'));
      callbacks.onComplete.mockImplementation(() => order.push('complete'));
      callbacks.onError.mockImplementation(() => order.push('error'));
      subscribeHeteroSession('s1', callbacks);

      const event = { type: 'stream_chunk' };
      options.onData({ event, type: 'event' });
      options.onData({ error: 'boom', type: 'error' });
      options.onData({ type: 'complete' });

      expect(callbacks.onStreamEvent).toHaveBeenCalledWith(event);
      expect(callbacks.onError).toHaveBeenCalledWith('boom');
      expect(order).toEqual(['event', 'error', 'complete']);
    });

    it('falls back to the broadcasts when the stream cannot be opened', () => {
      const { unsubscribe } = subscribeHeteroSession('s1', callbacks);
      options.onError!(new Error('no handler'));

      listeners.get('heteroAgentSessionComplete')!({}, { sessionId: 's1' });
      expect(callbacks.onComplete).toHaveBeenCalledOnce();

      unsubscribe();
      expect(close).toHaveBeenCalledOnce();
      expect(listeners.size).toBe(0);
    });
  });

  describe('without port streams', () => {
    beforeEach(() => {
      mockOpenPortStream.mockReturnValue(null);
    });

    it('filters the legacy broadcasts by session id', async () => {
      const { sync, unsubscribe } = subscribeHeteroSession('s1', callbacks);
      // Broadcasts share the IPC pipe with invoke replies, so there is nothing to wait for.
      await expect(sync()).resolves.toBeUndefined();

      listeners.get('heteroAgentEvent')!({}, { event: { type: 'a' }, sessionId: 'other' });
      listeners.get('heteroAgentEvent')!({}, { event: { type: 'b' }, sessionId: 's1' });
      listeners.get('heteroAgentSessionError')!({}, { error: 'boom', sessionId: 's1' });

      expect(callbacks.onStreamEvent).toHaveBeenCalledExactlyOnceWith({ type: 'b' });
      expect(callbacks.onError).toHaveBeenCalledExactlyOnceWith('boom');

      unsubscribe();
      expect(listeners.size).toBe(0);
    });
  });
});
