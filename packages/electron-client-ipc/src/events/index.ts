import { DevtoolsDispatchEvents } from './devtools';

/**
 * renderer -> main dispatch events
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ClientDispatchEvents extends DevtoolsDispatchEvents {}

export type ClientDispatchEventKey = keyof ClientDispatchEvents;

export type ClientEventReturnType<T extends ClientDispatchEventKey> = ReturnType<
  ClientDispatchEvents[T]
>;
