import type {
  ClientDispatchEventKey,
  ClientDispatchEvents,
  ClientEventReturnType,
} from '../events';

export type DispatchInvoke = <T extends ClientDispatchEventKey>(
  event: T,
  ...data: Parameters<ClientDispatchEvents[T]>
) => Promise<ClientEventReturnType<T>>;
