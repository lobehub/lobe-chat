import type {
  HeterogeneousAgentSessionError,
  HeterogeneousAgentSessionStreamMessage,
} from '@lobechat/electron-client-ipc';
import { HETERO_SESSION_PORT_STREAM } from '@lobechat/electron-client-ipc';
import { BrowserWindow } from 'electron';

import type { PortStreamManager } from '@/core/infrastructure/PortStreamManager';

type SessionPayload = {
  error?: HeterogeneousAgentSessionError | string;
  event?: unknown;
  sessionId?: string;
};

const toSessionStreamMessage = (
  channel: string,
  data: SessionPayload,
): HeterogeneousAgentSessionStreamMessage | undefined => {
  switch (channel) {
    case 'heteroAgentEvent': {
      return { event: data.event, type: 'event' };
    }
    case 'heteroAgentSessionComplete': {
      return { type: 'complete' };
    }
    case 'heteroAgentSessionError': {
      return { error: data.error ?? '', type: 'error' };
    }
  }
};

/**
 * Delivers a heterogeneous-agent IPC message to the renderer.
 *
 * Session-scoped messages (event / complete / error) are published on the
 * session's port stream so they stay in one ordered stream. Once the renderer
 * running that session opened the stream, they reach only that window;
 * otherwise, and for global messages such as runtime status, every window
 * still receives the legacy broadcast.
 */
export const broadcastHeteroIpc = (
  portStreamManager: PortStreamManager | undefined,
  channel: string,
  data: unknown,
): void => {
  const payload = data as SessionPayload;
  const message = payload?.sessionId ? toSessionStreamMessage(channel, payload) : undefined;
  if (
    message &&
    portStreamManager?.publish(HETERO_SESSION_PORT_STREAM, payload.sessionId!, message)
  ) {
    return;
  }

  for (const win of BrowserWindow.getAllWindows()) {
    if (!win.isDestroyed()) win.webContents.send(channel, data);
  }
};

/** Ends a session's port stream so its subscriber is released and the replay buffer can go. */
export const endHeteroSessionStream = (
  portStreamManager: PortStreamManager | undefined,
  sessionId: string,
): void => portStreamManager?.end(HETERO_SESSION_PORT_STREAM, sessionId);
