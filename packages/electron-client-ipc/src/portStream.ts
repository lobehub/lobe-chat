import type {
  PortStreamFrame,
  PortStreamHeadParams,
  PortStreamPortMessage,
} from './types/portStream';
import { PORT_STREAM_WINDOW_MESSAGE_TYPE } from './types/portStream';

export interface PortStreamHandlers<T> {
  onData: (data: T) => void;
  /** The publisher ended the stream. The subscription is already closed. */
  onEnd?: () => void;
  /** The stream could not be opened. The subscription is already closed. */
  onError?: (error: Error) => void;
  /** Frames after the cursor were evicted before they could be replayed. */
  onGap?: (from: number) => void;
}

export interface OpenPortStreamOptions<T> extends PortStreamHandlers<T> {
  after?: number;
  key: string;
  name: string;
}

export interface PortStreamSubscription {
  close: () => void;
  /**
   * Resolves once every frame the main process had published when this was
   * called has been delivered, the stream closed, or `timeoutMs` elapsed.
   *
   * Use when:
   * - An `invoke` reply means "the publisher is done" and the caller must not
   *   act before the stream caught up. The port is a separate pipe from IPC
   *   replies, so it can lag behind them.
   */
  sync: (timeoutMs?: number) => Promise<void>;
}

const DEFAULT_SYNC_TIMEOUT_MS = 3000;

const createRequestId = () =>
  globalThis.crypto?.randomUUID?.() ?? `port_${Date.now()}_${Math.random().toString(16).slice(2)}`;

const isPortMessage = (data: unknown, requestId: string): data is PortStreamPortMessage =>
  !!data &&
  typeof data === 'object' &&
  (data as PortStreamPortMessage).type === PORT_STREAM_WINDOW_MESSAGE_TYPE &&
  (data as PortStreamPortMessage).requestId === requestId;

/**
 * Subscribes to an ordered main-process stream over a dedicated `MessagePort`.
 *
 * Returns `null` when the preload does not support port streams, so callers
 * can keep their broadcast listener as the fallback. Frames already delivered
 * are skipped by `seq`, so a replay never repeats data.
 */
export const openPortStream = <T>(
  options: OpenPortStreamOptions<T>,
): PortStreamSubscription | null => {
  if (typeof window === 'undefined') return null;
  const open = window.electronAPI?.openPortStream;
  if (!open) return null;

  const { after = 0, key, name } = options;
  const requestId = createRequestId();
  let lastSeq = after;
  let closed = false;
  let port: MessagePort | undefined;
  const syncWaiters = new Set<{ resolve: () => void; seq: number }>();

  const settleSyncWaiters = () => {
    for (const waiter of syncWaiters) {
      if (closed || lastSeq >= waiter.seq) {
        syncWaiters.delete(waiter);
        waiter.resolve();
      }
    }
  };

  const handleFrame = (frame: PortStreamFrame<T>) => {
    if (closed) return;

    switch (frame.type) {
      case 'data': {
        if (frame.seq <= lastSeq) return;
        lastSeq = frame.seq;
        options.onData(frame.data);
        settleSyncWaiters();
        return;
      }
      case 'gap': {
        lastSeq = Math.max(lastSeq, frame.from - 1);
        options.onGap?.(frame.from);
        settleSyncWaiters();
        return;
      }
      case 'end': {
        close();
        options.onEnd?.();
        return;
      }
    }
  };

  const onWindowMessage = (event: MessageEvent) => {
    if (event.source !== window || !isPortMessage(event.data, requestId)) return;
    window.removeEventListener('message', onWindowMessage);

    const [received] = event.ports;
    if (!received) return;
    if (closed) {
      received.close();
      return;
    }

    port = received;
    port.onmessage = (message: MessageEvent<PortStreamFrame<T>>) => handleFrame(message.data);
  };

  function close() {
    if (closed) return;
    closed = true;
    window.removeEventListener('message', onWindowMessage);
    if (port) {
      port.onmessage = null;
      port.close();
    }
    settleSyncWaiters();
  }

  const sync = async (timeoutMs = DEFAULT_SYNC_TIMEOUT_MS) => {
    if (closed) return;

    const headParams: PortStreamHeadParams = { key, name };
    const head = await window.electronAPI
      ?.invoke?.<number>('portStream.head', headParams)
      .catch(() => undefined);
    if (closed || head === undefined || lastSeq >= head) return;

    await new Promise<void>((resolve) => {
      const waiter = {
        resolve: () => {
          clearTimeout(timer);
          resolve();
        },
        seq: head,
      };
      const timer = setTimeout(() => {
        syncWaiters.delete(waiter);
        resolve();
      }, timeoutMs);
      syncWaiters.add(waiter);
    });
  };

  // Listen before requesting: the preload may forward the port before `open` resolves.
  window.addEventListener('message', onWindowMessage);
  open({ after, key, name, requestId }).catch((error: unknown) => {
    if (closed) return;
    close();
    options.onError?.(error instanceof Error ? error : new Error(String(error)));
  });

  return { close, sync };
};
