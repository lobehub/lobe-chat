import type { AgentStreamEvent } from '@lobechat/agent-gateway-client';
import type {
  HeterogeneousAgentSessionError,
  HeterogeneousAgentSessionStreamMessage,
} from '@lobechat/electron-client-ipc';
import { HETERO_SESSION_PORT_STREAM, openPortStream } from '@lobechat/electron-client-ipc';

export interface HeteroSessionCallbacks {
  onComplete: () => void;
  onError: (error: HeterogeneousAgentSessionError | string) => void;
  onStreamEvent: (event: AgentStreamEvent) => void;
}

export interface HeteroSessionSubscription {
  /**
   * Waits until every message the main process published so far was
   * dispatched. Call it after `sendPrompt` settles: its reply can overtake the
   * port, while the legacy broadcasts shared the reply's IPC pipe and always
   * landed first.
   */
  sync: () => Promise<void>;
  unsubscribe: () => void;
}

/**
 * Legacy transport: every window receives every session's broadcasts on three
 * separate channels and filters by `sessionId`.
 */
const subscribeBroadcasts = (sessionId: string, callbacks: HeteroSessionCallbacks) => {
  if (!window.electron?.ipcRenderer) return () => {};

  const ipc = window.electron.ipcRenderer;

  const onStreamEvent = (_e: any, data: { event: AgentStreamEvent; sessionId: string }) => {
    if (data.sessionId === sessionId) callbacks.onStreamEvent(data.event);
  };
  const onComplete = (_e: any, data: { sessionId: string }) => {
    if (data.sessionId === sessionId) callbacks.onComplete();
  };
  const onError = (
    _e: any,
    data: { error: HeterogeneousAgentSessionError | string; sessionId: string },
  ) => {
    if (data.sessionId === sessionId) callbacks.onError(data.error);
  };

  const unsubscribeStreamEvent = ipc.on('heteroAgentEvent' as any, onStreamEvent);
  const unsubscribeComplete = ipc.on('heteroAgentSessionComplete' as any, onComplete);
  const unsubscribeError = ipc.on('heteroAgentSessionError' as any, onError);

  return () => {
    unsubscribeStreamEvent();
    unsubscribeComplete();
    unsubscribeError();
  };
};

/**
 * Subscribe to a local heterogeneous-agent session. The main process runs JSONL
 * framing + adapter conversion + `toStreamEvent` itself (`AgentStreamPipeline`
 * from `@lobechat/heterogeneous-agents/spawn`), so the renderer receives
 * ready-made `AgentStreamEvent`s with no per-event adapter step.
 *
 * Prefers the session's port stream: one ordered stream for events, completion
 * and errors, delivered only to this window and replayed from the session start
 * so nothing published before the port arrives is lost. Falls back to the
 * legacy broadcasts when the preload has no port streams or opening fails.
 */
export const subscribeHeteroSession = (
  sessionId: string,
  callbacks: HeteroSessionCallbacks,
): HeteroSessionSubscription => {
  let unsubscribeFallback: (() => void) | undefined;

  const subscription = openPortStream<HeterogeneousAgentSessionStreamMessage<AgentStreamEvent>>({
    key: sessionId,
    name: HETERO_SESSION_PORT_STREAM,
    onData: (message) => {
      switch (message.type) {
        case 'event': {
          callbacks.onStreamEvent(message.event);
          return;
        }
        case 'complete': {
          callbacks.onComplete();
          return;
        }
        case 'error': {
          callbacks.onError(message.error);
          return;
        }
      }
    },
    onError: (error) => {
      console.warn('[HeterogeneousAgent] session port stream failed, using broadcasts:', error);
      unsubscribeFallback = subscribeBroadcasts(sessionId, callbacks);
    },
    onGap: (from) => {
      console.warn(`[HeterogeneousAgent] session stream evicted frames before seq ${from}`);
    },
  });

  if (!subscription) {
    return { sync: async () => {}, unsubscribe: subscribeBroadcasts(sessionId, callbacks) };
  }

  return {
    sync: () => subscription.sync(),
    unsubscribe: () => {
      subscription.close();
      unsubscribeFallback?.();
    },
  };
};
