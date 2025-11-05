import type { ClientDispatchEvents } from '@lobechat/electron-client-ipc';
import type { ServerDispatchEvents } from '@lobechat/electron-server-ipc';

import type { App } from '@/core/App';
import { IoCContainer } from '@/core/infrastructure/IoCContainer';
import { ShortcutActionType } from '@/shortcuts';

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
 * IPC client event decorator for controllers
 */
export const ipcClientEvent = (method: keyof ClientDispatchEvents) =>
  ipcDecorator(method, 'client');

/**
 * IPC server event decorator for controllers
 */
export const ipcServerEvent = (method: keyof ServerDispatchEvents) =>
  ipcDecorator(method, 'server');

const shortcutDecorator = (name: string) => (target: any, methodName: string, descriptor?: any) => {
  const actions = IoCContainer.shortcuts.get(target.constructor) || [];
  actions.push({ methodName, name });

  IoCContainer.shortcuts.set(target.constructor, actions);

  return descriptor;
};

/**
 *  shortcut inject decorator
 */
export const shortcut = (method: ShortcutActionType) => shortcutDecorator(method);

const protocolDecorator =
  (urlType: string, action: string) => (target: any, methodName: string, descriptor?: any) => {
    const handlers = IoCContainer.protocolHandlers.get(target.constructor) || [];
    handlers.push({ action, methodName, urlType });

    IoCContainer.protocolHandlers.set(target.constructor, handlers);

    return descriptor;
  };

/**
 * Protocol handler decorator
 * @param urlType Protocol URL type (e.g., 'plugin')
 * @param action Action type (e.g., 'install')
 */
export const createProtocolHandler = (urlType: string) => (action: string) =>
  protocolDecorator(urlType, action);

interface IControllerModule {
  afterAppReady?(): void;
  app: App;
  beforeAppReady?(): void;
}

export class ControllerModule implements IControllerModule {
  constructor(public app: App) {
    this.app = app;
  }
}

export type IControlModule = typeof ControllerModule;
