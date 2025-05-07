/* eslint-disable typescript-sort-keys/interface, sort-keys-fix/sort-keys-fix */
import { DatabaseDispatchEvents } from './database';
import { FileDispatchEvents } from './file';
import { StoragePathDispatchEvents } from './storagePath';

/**
 * next server -> main dispatch events
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ServerDispatchEvents
  extends StoragePathDispatchEvents,
    DatabaseDispatchEvents,
    FileDispatchEvents {}

export type ServerDispatchEventKey = keyof ServerDispatchEvents;

export type ServerEventReturnType<T extends ServerDispatchEventKey> = ReturnType<
  ServerDispatchEvents[T]
>;

export type ServerEventParams<T extends ServerDispatchEventKey> = Parameters<
  ServerDispatchEvents[T]
>[0];

export type IPCServerEventHandler = {
  [key in ServerDispatchEventKey]: (
    params: ServerEventParams<key>,
  ) => Promise<ServerEventReturnType<key>>;
};
