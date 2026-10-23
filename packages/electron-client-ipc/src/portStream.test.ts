import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { openPortStream } from './portStream';
import type { PortStreamFrame, PortStreamOpenParams } from './types/portStream';
import { PORT_STREAM_WINDOW_MESSAGE_TYPE } from './types/portStream';

type FakeWindow = EventTarget & {
  electronAPI?: {
    invoke?: (channel: string, ...args: unknown[]) => Promise<any>;
    openPortStream?: (params: PortStreamOpenParams) => Promise<void>;
  };
};

const originalWindow = (globalThis as any).window;

describe('openPortStream', () => {
  let fakeWindow: FakeWindow;
  let openRequests: PortStreamOpenParams[];
  let channels: MessageChannel[];
  let head: number;

  /** Plays the preload: hands a port for `requestId` to the page and returns the main-side end. */
  const deliverPort = (requestId: string, source: unknown = fakeWindow) => {
    const channel = new MessageChannel();
    channels.push(channel);
    const event = Object.assign(new Event('message'), {
      data: { requestId, type: PORT_STREAM_WINDOW_MESSAGE_TYPE },
      ports: [channel.port2],
      source,
    });
    fakeWindow.dispatchEvent(event);
    return channel.port1;
  };

  const flush = () => new Promise((resolve) => setTimeout(resolve, 10));

  const send = (port: MessagePort, frame: PortStreamFrame<string>) => port.postMessage(frame);

  beforeEach(() => {
    openRequests = [];
    channels = [];
    head = 0;
    fakeWindow = Object.assign(new EventTarget(), {
      electronAPI: {
        invoke: vi.fn(async (channel: string) => {
          if (channel !== 'portStream.head') throw new Error(`unexpected ${channel}`);
          return head;
        }),
        openPortStream: vi.fn(async (params: PortStreamOpenParams) => {
          openRequests.push(params);
        }),
      },
    });
    (globalThis as any).window = fakeWindow;
  });

  afterEach(() => {
    for (const channel of channels) {
      channel.port1.close();
      channel.port2.close();
    }
    (globalThis as any).window = originalWindow;
  });

  it('returns null when the preload has no port streams', () => {
    fakeWindow.electronAPI = {};

    expect(openPortStream({ key: 's1', name: 'test', onData: vi.fn() })).toBeNull();
  });

  it('requests the stream from the cursor and delivers data frames in order', async () => {
    const onData = vi.fn();
    openPortStream({ after: 3, key: 's1', name: 'test', onData });
    const [request] = openRequests;
    expect(request).toMatchObject({ after: 3, key: 's1', name: 'test' });

    const port = deliverPort(request.requestId);
    send(port, { data: 'a', seq: 4, type: 'data' });
    send(port, { data: 'b', seq: 5, type: 'data' });
    await flush();

    expect(onData.mock.calls).toEqual([['a'], ['b']]);
  });

  it('skips frames it already delivered', async () => {
    const onData = vi.fn();
    openPortStream({ key: 's1', name: 'test', onData });

    const port = deliverPort(openRequests[0].requestId);
    send(port, { data: 'a', seq: 1, type: 'data' });
    send(port, { data: 'a-again', seq: 1, type: 'data' });
    send(port, { data: 'b', seq: 2, type: 'data' });
    await flush();

    expect(onData.mock.calls).toEqual([['a'], ['b']]);
  });

  it('reports a gap and continues from it', async () => {
    const onData = vi.fn();
    const onGap = vi.fn();
    openPortStream({ key: 's1', name: 'test', onData, onGap });

    const port = deliverPort(openRequests[0].requestId);
    send(port, { from: 5, type: 'gap' });
    send(port, { data: 'e', seq: 5, type: 'data' });
    await flush();

    expect(onGap).toHaveBeenCalledWith(5);
    expect(onData.mock.calls).toEqual([['e']]);
  });

  it('calls onEnd and stops delivering after the end frame', async () => {
    const onData = vi.fn();
    const onEnd = vi.fn();
    openPortStream({ key: 's1', name: 'test', onData, onEnd });

    const port = deliverPort(openRequests[0].requestId);
    send(port, { seq: 1, type: 'end' });
    send(port, { data: 'late', seq: 2, type: 'data' });
    await flush();

    expect(onEnd).toHaveBeenCalledOnce();
    expect(onData).not.toHaveBeenCalled();
  });

  it('ignores ports for other requests or from other sources', async () => {
    const onData = vi.fn();
    openPortStream({ key: 's1', name: 'test', onData });

    const otherRequest = deliverPort('someone-else');
    const otherSource = deliverPort(openRequests[0].requestId, {});
    send(otherRequest, { data: 'x', seq: 1, type: 'data' });
    send(otherSource, { data: 'y', seq: 1, type: 'data' });
    await flush();

    expect(onData).not.toHaveBeenCalled();
  });

  it('stops delivering once closed', async () => {
    const onData = vi.fn();
    const subscription = openPortStream({ key: 's1', name: 'test', onData })!;

    const port = deliverPort(openRequests[0].requestId);
    subscription.close();
    send(port, { data: 'a', seq: 1, type: 'data' });
    await flush();

    expect(onData).not.toHaveBeenCalled();
  });

  it('reports a failed open and ignores a port that arrives afterwards', async () => {
    const onData = vi.fn();
    const onError = vi.fn();
    fakeWindow.electronAPI!.openPortStream = vi.fn(async (params: PortStreamOpenParams) => {
      openRequests.push(params);
      throw new Error('no handler');
    });

    openPortStream({ key: 's1', name: 'test', onData, onError });
    await flush();

    const port = deliverPort(openRequests[0].requestId);
    send(port, { data: 'a', seq: 1, type: 'data' });
    await flush();

    expect(onError).toHaveBeenCalledWith(new Error('no handler'));
    expect(onData).not.toHaveBeenCalled();
  });

  describe('sync', () => {
    it('waits until frames published before the call were delivered', async () => {
      const onData = vi.fn();
      const subscription = openPortStream({ key: 's1', name: 'test', onData })!;
      const port = deliverPort(openRequests[0].requestId);
      head = 2;

      let synced = false;
      const syncing = subscription.sync().then(() => {
        synced = true;
      });
      send(port, { data: 'a', seq: 1, type: 'data' });
      await flush();
      expect(synced).toBe(false);

      send(port, { data: 'b', seq: 2, type: 'data' });
      await syncing;

      expect(onData.mock.calls).toEqual([['a'], ['b']]);
      expect(fakeWindow.electronAPI!.invoke).toHaveBeenCalledWith('portStream.head', {
        key: 's1',
        name: 'test',
      });
    });

    it('resolves at once when the stream already caught up', async () => {
      const subscription = openPortStream({ key: 's1', name: 'test', onData: vi.fn() })!;

      await expect(subscription.sync()).resolves.toBeUndefined();
    });

    it('resolves when the stream closes before reaching the head', async () => {
      const subscription = openPortStream({ key: 's1', name: 'test', onData: vi.fn() })!;
      deliverPort(openRequests[0].requestId);
      head = 5;

      const syncing = subscription.sync();
      await flush();
      subscription.close();

      await expect(syncing).resolves.toBeUndefined();
    });

    it('gives up after the timeout when frames never arrive', async () => {
      const subscription = openPortStream({ key: 's1', name: 'test', onData: vi.fn() })!;
      head = 5;

      await expect(subscription.sync(20)).resolves.toBeUndefined();
    });
  });
});
