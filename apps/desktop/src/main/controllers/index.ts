import type { ClientDispatchEvents } from '@lobechat/electron-client-ipc';
import type { ServerDispatchEvents } from '@lobechat/electron-server-ipc';

import type { App } from '@/core/App';
import { IoCContainer } from '@/core/IoCContainer';

const ipcDecorator =
  (name: string, mode: 'client' | 'server') =>
  (target: any, methodName: string, descriptor?: any) => {
    const actions = IoCContainer.controllers.get(target.constructor) || [];
    actions.push({
      methodName,
      mode,
      name,
    });
    IoCContainer.controllers.set(target.constructor, actions);
    return descriptor;
  };

/**
 *  controller 用的 ipc client event 装饰器
 */
export const ipcClientEvent = (method: keyof ClientDispatchEvents) =>
  ipcDecorator(method, 'client');

/**
 *  controller 用的 ipc server event 装饰器
 */
export const ipcServerEvent = (method: keyof ServerDispatchEvents) =>
  ipcDecorator(method, 'server');

export class ControllerModule {
  constructor(public app: App) {
    this.app = app;
  }
}

export type IControlModule = typeof ControllerModule;
