import net from 'node:net';

import { ServerDispatchEventKey } from '../events';

export type IPCEventMethod = (
  params: any,
  context: { id: string; method: string; socket: net.Socket },
) => Promise<any>;

export type ElectronIPCEventHandler = {
  [key in ServerDispatchEventKey]: IPCEventMethod;
};

export * from './file';
