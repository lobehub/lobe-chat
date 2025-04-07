import { FilesDispatchEvents } from './file';
import { MenuDispatchEvents } from './menu';
import { FilesSearchDispatchEvents } from './search';
import { SystemDispatchEvents } from './system';
import { WindowsDispatchEvents } from './windows';

/**
 * renderer -> main dispatch events
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ClientDispatchEvents
  extends WindowsDispatchEvents,
    FilesSearchDispatchEvents,
    SystemDispatchEvents,
    MenuDispatchEvents,
    FilesDispatchEvents {}

export type ClientDispatchEventKey = keyof ClientDispatchEvents;

export type ClientEventReturnType<T extends ClientDispatchEventKey> = ReturnType<
  ClientDispatchEvents[T]
>;
