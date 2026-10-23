import type {
  PortStreamOpenParams,
  PortStreamPortMessage,
} from '@lobechat/electron-client-ipc/types/port-stream';
import {
  PORT_STREAM_IPC_CHANNEL,
  PORT_STREAM_WINDOW_MESSAGE_TYPE,
} from '@lobechat/electron-client-ipc/types/port-stream';
import { ipcRenderer } from 'electron';

import { invoke } from './invoke';

/**
 * `contextBridge` cannot pass a `MessagePort` into the page, so the preload
 * re-posts each transferred port to the page's own window, tagged with the
 * renderer's request id (Electron's documented context-isolation pattern).
 */
export const setupPortStreamForwarding = () => {
  ipcRenderer.on(PORT_STREAM_IPC_CHANNEL, (event, { requestId }: { requestId: string }) => {
    const [port] = event.ports;
    if (!port) return;

    const message: PortStreamPortMessage = { requestId, type: PORT_STREAM_WINDOW_MESSAGE_TYPE };
    window.postMessage(message, '*', [port]);
  });
};

export const openPortStream = (params: PortStreamOpenParams): Promise<void> =>
  invoke('portStream.open', params);
