import { EventEmitter } from 'node:events';

import { PORT_STREAM_IPC_CHANNEL } from '@lobechat/electron-client-ipc';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { PortStreamPort, PortStreamSender } from '../PortStreamManager';
import { PortStreamManager } from '../PortStreamManager';

vi.mock('electron', () => ({ MessageChannelMain: vi.fn() }));

vi.mock('@/utils/logger', () => ({
  createLogger: () => ({ debug: vi.fn(), error: vi.fn(), info: vi.fn(), warn: vi.fn() }),
}));

class FakePort extends EventEmitter implements PortStreamPort {
  closed = false;
  frames: unknown[] = [];

  close = vi.fn(() => {
    this.closed = true;
  });

  postMessage = (message: unknown) => {
    this.frames.push(message);
  };

  start = vi.fn();

  /** Simulates the renderer closing its end. */
  remoteClose() {
    this.emit('close');
  }
}

class FakeSender extends EventEmitter {
  destroyed = false;
  posted: { channel: string; message: unknown; transfer: unknown[] }[] = [];

  constructor(public id: number) {
    super();
  }

  isDestroyed = () => this.destroyed;

  postMessage = (channel: string, message: unknown, transfer: unknown[]) => {
    this.posted.push({ channel, message, transfer });
  };
}

const NAME = 'heteroSession';

describe('PortStreamManager', () => {
  let ports: FakePort[];
  let manager: PortStreamManager;

  const createManager = (options: { maxBufferedFrames?: number } = {}) =>
    new PortStreamManager({
      createChannel: () => {
        const port1 = new FakePort();
        ports.push(port1);
        return { port1, port2: { transferred: ports.length } };
      },
      endedRetentionMs: 1000,
      idleRetentionMs: 5000,
      ...options,
    });

  const open = (sender: FakeSender, key: string, after?: number) => {
    manager.open(sender as unknown as PortStreamSender, {
      after,
      key,
      name: NAME,
      requestId: `req-${key}-${sender.id}`,
    });
    return ports.at(-1)!;
  };

  beforeEach(() => {
    ports = [];
    manager = createManager();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('transfers the port to the opening window with its request id', () => {
    const sender = new FakeSender(1);
    open(sender, 's1');

    expect(sender.posted).toEqual([
      {
        channel: PORT_STREAM_IPC_CHANNEL,
        message: { requestId: 'req-s1-1' },
        transfer: [{ transferred: 1 }],
      },
    ]);
  });

  it('replays frames published before the port was opened, then streams live frames', () => {
    expect(manager.publish(NAME, 's1', 'a')).toBe(false);
    expect(manager.publish(NAME, 's1', 'b')).toBe(false);

    const port = open(new FakeSender(1), 's1');
    expect(manager.publish(NAME, 's1', 'c')).toBe(true);

    expect(port.frames).toEqual([
      { data: 'a', seq: 1, type: 'data' },
      { data: 'b', seq: 2, type: 'data' },
      { data: 'c', seq: 3, type: 'data' },
    ]);
  });

  it('replays only frames after the cursor', () => {
    manager.publish(NAME, 's1', 'a');
    manager.publish(NAME, 's1', 'b');

    const port = open(new FakeSender(1), 's1', 1);

    expect(port.frames).toEqual([{ data: 'b', seq: 2, type: 'data' }]);
  });

  it('reports a gap when frames after the cursor were evicted', () => {
    manager = createManager({ maxBufferedFrames: 2 });
    manager.publish(NAME, 's1', 'a');
    manager.publish(NAME, 's1', 'b');
    manager.publish(NAME, 's1', 'c');

    const port = open(new FakeSender(1), 's1');

    expect(port.frames).toEqual([
      { from: 2, type: 'gap' },
      { data: 'b', seq: 2, type: 'data' },
      { data: 'c', seq: 3, type: 'data' },
    ]);
  });

  it('delivers frames only to windows that opened that stream', () => {
    const first = open(new FakeSender(1), 's1');
    const second = open(new FakeSender(2), 's2');

    manager.publish(NAME, 's1', 'for-s1');

    expect(first.frames).toEqual([{ data: 'for-s1', seq: 1, type: 'data' }]);
    expect(second.frames).toEqual([]);
  });

  it('sends the end frame and closes subscribers when the stream ends', () => {
    const port = open(new FakeSender(1), 's1');
    manager.publish(NAME, 's1', 'a');

    manager.end(NAME, 's1');
    manager.publish(NAME, 's1', 'late');

    expect(port.frames).toEqual([
      { data: 'a', seq: 1, type: 'data' },
      { seq: 2, type: 'end' },
    ]);
    expect(port.closed).toBe(true);
  });

  it('replays an ended stream including its end frame to a late opener', () => {
    manager.publish(NAME, 's1', 'a');
    manager.end(NAME, 's1');

    const port = open(new FakeSender(1), 's1');

    expect(port.frames).toEqual([
      { data: 'a', seq: 1, type: 'data' },
      { seq: 2, type: 'end' },
    ]);
    expect(port.closed).toBe(true);
  });

  it('stops delivering after the renderer closes its port', () => {
    const port = open(new FakeSender(1), 's1');
    port.remoteClose();

    manager.publish(NAME, 's1', 'a');

    expect(port.frames).toEqual([]);
  });

  it.each(['destroyed', 'render-process-gone', 'did-navigate'])(
    'releases the window subscribers on %s',
    (event) => {
      const sender = new FakeSender(1);
      const port = open(sender, 's1');

      sender.emit(event);
      manager.publish(NAME, 's1', 'a');

      expect(port.closed).toBe(true);
      expect(port.frames).toEqual([]);
    },
  );

  it('keeps the stream claimed while its subscriber is gone, so the broadcast stays off', () => {
    const port = open(new FakeSender(1), 's1');
    port.remoteClose();

    expect(manager.publish(NAME, 's1', 'a')).toBe(true);
  });

  it('drops a stream nobody reads after the idle retention', () => {
    vi.useFakeTimers();
    const port = open(new FakeSender(1), 's1');
    port.remoteClose();

    vi.advanceTimersByTime(5000);

    expect(manager.publish(NAME, 's1', 'a')).toBe(false);
  });

  it('reports the newest published seq as the stream head', () => {
    expect(manager.head(NAME, 's1')).toBe(0);

    manager.publish(NAME, 's1', 'a');
    manager.publish(NAME, 's1', 'b');
    expect(manager.head(NAME, 's1')).toBe(2);

    manager.end(NAME, 's1');
    expect(manager.head(NAME, 's1')).toBe(3);
  });

  it('ignores open requests from a destroyed window', () => {
    const sender = new FakeSender(1);
    sender.destroyed = true;

    manager.open(sender as unknown as PortStreamSender, { key: 's1', name: NAME, requestId: 'r' });

    expect(ports).toEqual([]);
    expect(manager.publish(NAME, 's1', 'a')).toBe(false);
  });
});
