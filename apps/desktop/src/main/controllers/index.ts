import type { ClientDispatchEvents } from '@lobechat/electron-client-ipc';

import type { App } from '@/core/App';
import { IoCContainer } from '@/core/IoCContainer';

const baseDecorator =
  (name: string, showLog = true) =>
  (target: any, methodName: string, descriptor?: any) => {
    const actions = IoCContainer.controllers.get(target.constructor) || [];
    actions.push({
      methodName,
      name,
      showLog,
    });
    IoCContainer.controllers.set(target.constructor, actions);
    return descriptor;
  };

/**
 *  service 用的 event 装饰器
 */
export const ipcClientEvent = (method: keyof ClientDispatchEvents) => baseDecorator(method);

export class ControllerModule {
  constructor(public app: App) {
    this.app = app;
  }
}

export type IControlModule = typeof ControllerModule;
