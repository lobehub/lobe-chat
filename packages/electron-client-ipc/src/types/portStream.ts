/**
 * Ordered main → renderer streams carried over a dedicated `MessagePort`.
 *
 * The renderer opens a stream by `(name, key)` and receives frames only for
 * that stream, in publish order. Unlike `webContents.send` broadcasts, a
 * stream is scoped to the window that opened it and can replay from a cursor.
 */

/** Main → renderer IPC channel that carries the transferred port. */
export const PORT_STREAM_IPC_CHANNEL = 'portStream:port';

/** `window.postMessage` type the preload uses to hand the port to the page. */
export const PORT_STREAM_WINDOW_MESSAGE_TYPE = 'lobe:port-stream';

export interface PortStreamOpenParams {
  /** Replay frames with `seq > after`. Defaults to 0, i.e. everything still buffered. */
  after?: number;
  /** Stream instance, e.g. a hetero session id. */
  key: string;
  /** Stream family, e.g. {@link HETERO_SESSION_PORT_STREAM}. */
  name: string;
  /** Renderer-generated id matching the transferred port to this request. */
  requestId: string;
}

export interface PortStreamHeadParams {
  key: string;
  name: string;
}

export interface PortStreamPortMessage {
  requestId: string;
  type: typeof PORT_STREAM_WINDOW_MESSAGE_TYPE;
}

export type PortStreamFrame<T = unknown> =
  | { data: T; seq: number; type: 'data' }
  /** The publisher closed the stream; no frame follows. */
  | { seq: number; type: 'end' }
  /**
   * Frames after the requested cursor were evicted from the replay buffer.
   * Frames from `from` onwards follow.
   */
  | { from: number; type: 'gap' };

export const HETERO_SESSION_PORT_STREAM = 'heteroSession';
