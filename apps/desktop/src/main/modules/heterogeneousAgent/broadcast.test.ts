import { HETERO_SESSION_PORT_STREAM } from '@lobechat/electron-client-ipc';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PortStreamManager } from '@/core/infrastructure/PortStreamManager';

import { broadcastHeteroIpc, endHeteroSessionStream } from './broadcast';

const { mockGetAllWindows } = vi.hoisted(() => ({ mockGetAllWindows: vi.fn() }));

vi.mock('electron', () => ({ BrowserWindow: { getAllWindows: mockGetAllWindows } }));

describe('broadcastHeteroIpc', () => {
  const send = vi.fn();
  const publish = vi.fn();
  const end = vi.fn();
  const manager = { end, publish } as unknown as PortStreamManager;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAllWindows.mockReturnValue([
      { isDestroyed: () => false, webContents: { send } },
      { isDestroyed: () => true, webContents: { send } },
    ]);
  });

  it.each([
    [
      'heteroAgentEvent',
      { event: { type: 'stream_chunk' }, sessionId: 's1' },
      { event: { type: 'stream_chunk' }, type: 'event' },
    ],
    ['heteroAgentSessionComplete', { sessionId: 's1' }, { type: 'complete' }],
    [
      'heteroAgentSessionError',
      { error: 'boom', sessionId: 's1' },
      { error: 'boom', type: 'error' },
    ],
  ])('sends %s only over the session stream once it is opened', (channel, data, message) => {
    publish.mockReturnValue(true);

    broadcastHeteroIpc(manager, channel, data);

    expect(publish).toHaveBeenCalledWith(HETERO_SESSION_PORT_STREAM, 's1', message);
    expect(send).not.toHaveBeenCalled();
  });

  it('keeps broadcasting session messages while no renderer opened the stream', () => {
    publish.mockReturnValue(false);
    const data = { sessionId: 's1' };

    broadcastHeteroIpc(manager, 'heteroAgentSessionComplete', data);

    expect(publish).toHaveBeenCalledOnce();
    expect(send).toHaveBeenCalledExactlyOnceWith('heteroAgentSessionComplete', data);
  });

  it('broadcasts global messages without touching session streams', () => {
    const status = { sessionId: 's1', state: 'running' };

    broadcastHeteroIpc(manager, 'heteroAgentRuntimeStatus', status);

    expect(publish).not.toHaveBeenCalled();
    expect(send).toHaveBeenCalledExactlyOnceWith('heteroAgentRuntimeStatus', status);
  });

  it('broadcasts when no port stream manager is available', () => {
    broadcastHeteroIpc(undefined, 'heteroAgentSessionComplete', { sessionId: 's1' });

    expect(send).toHaveBeenCalledOnce();
  });

  it('ends the session stream', () => {
    endHeteroSessionStream(manager, 's1');

    expect(end).toHaveBeenCalledWith(HETERO_SESSION_PORT_STREAM, 's1');
  });
});
