import type { PortStreamFrame, PortStreamOpenParams } from '@lobechat/electron-client-ipc';
import { PORT_STREAM_IPC_CHANNEL } from '@lobechat/electron-client-ipc';
import type { WebContents } from 'electron';
import { MessageChannelMain } from 'electron';

import { createLogger } from '@/utils/logger';

const logger = createLogger('core:PortStreamManager');

/** Structural subset of `MessagePortMain`, so tests can inject plain objects. */
export interface PortStreamPort {
  close: () => void;
  on: (event: 'close', listener: () => void) => unknown;
  postMessage: (message: unknown) => void;
  start: () => void;
}

export interface PortStreamChannel {
  port1: PortStreamPort;
  port2: unknown;
}

export type PortStreamSender = Pick<WebContents, 'id' | 'isDestroyed' | 'on' | 'postMessage'>;

export interface PortStreamManagerOptions {
  createChannel?: () => PortStreamChannel;
  /** How long an ended stream stays replayable once nobody is subscribed. */
  endedRetentionMs?: number;
  /** How long a stream without subscribers or new frames is kept before it is dropped. */
  idleRetentionMs?: number;
  /** Frames kept per stream for replay; older frames are evicted. */
  maxBufferedFrames?: number;
}

type BufferedFrame = Exclude<PortStreamFrame, { type: 'gap' }>;

interface Subscriber {
  port: PortStreamPort;
  senderId: number;
  stream: StreamState;
}

interface StreamState {
  /**
   * Set once any renderer opened this stream. From then on the publisher stops
   * broadcasting the same data, because the opener reads it from the port.
   */
  claimed: boolean;
  disposeTimer?: ReturnType<typeof setTimeout>;
  ended: boolean;
  frames: BufferedFrame[];
  id: string;
  nextSeq: number;
  subscribers: Set<Subscriber>;
}

const DEFAULT_MAX_BUFFERED_FRAMES = 2000;
const DEFAULT_IDLE_RETENTION_MS = 5 * 60_000;
const DEFAULT_ENDED_RETENTION_MS = 30_000;

const toStreamId = (name: string, key: string) => `${name}\u0000${key}`;

/**
 * Ordered main → renderer streams over dedicated `MessagePort`s.
 *
 * Every published frame gets a per-stream `seq` and is buffered, so a renderer
 * that opens a stream after the publisher started (the open round-trip races
 * the first frames) still receives everything from its cursor. Frames reach
 * only the windows that opened the stream, never every window.
 */
export class PortStreamManager {
  private readonly createChannel: () => PortStreamChannel;
  private readonly endedRetentionMs: number;
  private readonly idleRetentionMs: number;
  private readonly maxBufferedFrames: number;
  private readonly streams = new Map<string, StreamState>();
  private readonly subscribersBySender = new Map<number, Set<Subscriber>>();
  private readonly watchedSenders = new WeakSet<PortStreamSender>();

  constructor(options: PortStreamManagerOptions = {}) {
    this.createChannel =
      options.createChannel ?? (() => new MessageChannelMain() as unknown as PortStreamChannel);
    this.endedRetentionMs = options.endedRetentionMs ?? DEFAULT_ENDED_RETENTION_MS;
    this.idleRetentionMs = options.idleRetentionMs ?? DEFAULT_IDLE_RETENTION_MS;
    this.maxBufferedFrames = options.maxBufferedFrames ?? DEFAULT_MAX_BUFFERED_FRAMES;
  }

  /**
   * Appends a frame and delivers it to current subscribers.
   *
   * Returns:
   * - `true` when a renderer opened this stream, so the caller must not also
   *   broadcast the same data; `false` when the caller keeps its broadcast.
   */
  publish(name: string, key: string, data: unknown): boolean {
    const stream = this.getOrCreateStream(name, key);
    if (stream.ended) {
      logger.debug('Dropping frame published after stream end:', name, key);
      return stream.claimed;
    }

    const frame: BufferedFrame = { data, seq: stream.nextSeq++, type: 'data' };
    stream.frames.push(frame);
    if (stream.frames.length > this.maxBufferedFrames) stream.frames.shift();

    for (const subscriber of stream.subscribers) this.send(subscriber, frame);
    this.refreshDisposal(stream);

    return stream.claimed;
  }

  /** Seq of the newest frame published on the stream, or 0 when it has none. */
  head(name: string, key: string): number {
    const stream = this.streams.get(toStreamId(name, key));
    return stream ? stream.nextSeq - 1 : 0;
  }

  /** Sends the terminal `end` frame and closes every subscriber of the stream. */
  end(name: string, key: string): void {
    const stream = this.streams.get(toStreamId(name, key));
    if (!stream || stream.ended) return;

    stream.ended = true;
    const frame: BufferedFrame = { seq: stream.nextSeq++, type: 'end' };
    stream.frames.push(frame);

    for (const subscriber of stream.subscribers) {
      this.send(subscriber, frame);
      this.removeSubscriber(subscriber, true);
    }
    this.refreshDisposal(stream);
  }

  /**
   * Transfers a new port for `(name, key)` to `sender`, replays buffered frames
   * after `params.after`, then keeps delivering new frames until either side
   * closes or the window goes away.
   */
  open(sender: PortStreamSender, params: PortStreamOpenParams): void {
    if (sender.isDestroyed()) return;

    const stream = this.getOrCreateStream(params.name, params.key);
    stream.claimed = true;

    const { port1, port2 } = this.createChannel();
    sender.postMessage(PORT_STREAM_IPC_CHANNEL, { requestId: params.requestId }, [port2 as never]);

    const subscriber: Subscriber = { port: port1, senderId: sender.id, stream };
    this.replay(subscriber, params.after ?? 0);
    if (stream.ended) {
      port1.close();
      this.refreshDisposal(stream);
      return;
    }

    stream.subscribers.add(subscriber);
    let senderSubscribers = this.subscribersBySender.get(sender.id);
    if (!senderSubscribers) {
      senderSubscribers = new Set();
      this.subscribersBySender.set(sender.id, senderSubscribers);
    }
    senderSubscribers.add(subscriber);
    this.watchSender(sender);

    port1.on('close', () => this.removeSubscriber(subscriber, false));
    port1.start();
    this.refreshDisposal(stream);
  }

  private replay(subscriber: Subscriber, after: number) {
    const { frames } = subscriber.stream;
    const oldest = frames[0];
    if (oldest && oldest.seq > after + 1) {
      this.send(subscriber, { from: oldest.seq, type: 'gap' });
    }
    for (const frame of frames) {
      if (frame.seq > after) this.send(subscriber, frame);
    }
  }

  private send(subscriber: Subscriber, frame: PortStreamFrame) {
    try {
      subscriber.port.postMessage(frame);
    } catch (error) {
      logger.warn('Failed to post port stream frame:', error);
      this.removeSubscriber(subscriber, true);
    }
  }

  private removeSubscriber(subscriber: Subscriber, closePort: boolean) {
    const { stream } = subscriber;
    if (!stream.subscribers.delete(subscriber)) return;

    const senderSubscribers = this.subscribersBySender.get(subscriber.senderId);
    senderSubscribers?.delete(subscriber);
    if (senderSubscribers?.size === 0) this.subscribersBySender.delete(subscriber.senderId);

    if (closePort) subscriber.port.close();
    this.refreshDisposal(stream);
  }

  /** Port `close` is not guaranteed when the renderer reloads or crashes, so watch the window too. */
  private watchSender(sender: PortStreamSender) {
    if (this.watchedSenders.has(sender)) return;
    this.watchedSenders.add(sender);

    const release = () => {
      for (const subscriber of this.subscribersBySender.get(sender.id) ?? []) {
        this.removeSubscriber(subscriber, true);
      }
    };
    sender.on('destroyed', release);
    sender.on('render-process-gone', release);
    // Fires for main-frame document loads (reload included), not in-page route changes.
    sender.on('did-navigate', release);
  }

  private getOrCreateStream(name: string, key: string): StreamState {
    const id = toStreamId(name, key);
    let stream = this.streams.get(id);
    if (!stream) {
      stream = {
        claimed: false,
        ended: false,
        frames: [],
        id,
        nextSeq: 1,
        subscribers: new Set(),
      };
      this.streams.set(id, stream);
    }
    return stream;
  }

  /** Keeps a stream only while someone reads it or it may still be opened. */
  private refreshDisposal(stream: StreamState) {
    if (stream.disposeTimer) clearTimeout(stream.disposeTimer);
    stream.disposeTimer = undefined;
    if (stream.subscribers.size > 0) return;

    const delay = stream.ended ? this.endedRetentionMs : this.idleRetentionMs;
    stream.disposeTimer = setTimeout(() => {
      if (this.streams.get(stream.id) === stream && stream.subscribers.size === 0) {
        this.streams.delete(stream.id);
      }
    }, delay);
    stream.disposeTimer.unref?.();
  }
}
