import { Session, app, ipcMain, protocol } from 'electron';
import { macOS, windows } from 'electron-is';
import { join } from 'node:path';

import { buildDir, nextStandaloneDir } from '@/const/dir';
import { isDev } from '@/const/env';
import { IControlModule } from '@/controllers';
import { IServiceModule } from '@/services';
import { createHandler } from '@/utils/next-electron-rsc';

import BrowserManager from './BrowserManager';
import { I18nManager } from './I18nManager';
import { initIPCServer } from './IPCServer';
import { IoCContainer } from './IoCContainer';
import MenuManager from './MenuManager';

export type IPCClientEventMap = Map<string, { controller: any; methodName: string }>;
type Class<T> = new (...args: any[]) => T;

const importAll = (r: any) => Object.values(r).map((v: any) => v.default);

export class App {
  nextServerUrl = 'http://localhost:3010';

  browserManager: BrowserManager;
  menuManager: MenuManager;
  i18n: I18nManager;

  constructor() {
    // load controllers
    const controllers: IControlModule[] = importAll(
      (import.meta as any).glob('@/controllers/*Ctr.ts', { eager: true }),
    );

    controllers.forEach((controller) => this.addController(controller));

    // load services
    const services: IServiceModule[] = importAll(
      (import.meta as any).glob('@/services/*Srv.ts', { eager: true }),
    );

    services.forEach((service) => this.addService(service));

    // 批量注册 controller 中 event 事件 供 render 端消费
    this.ipcClientEventMap.forEach((serviceInfo, key) => {
      const { controller, methodName } = serviceInfo;

      ipcMain.handle(key, async (e, ...data) => {
        try {
          return await controller[methodName](...data);
        } catch (error) {
          return { error: error.message };
        }
      });
    });

    this.i18n = new I18nManager(this);
    this.browserManager = new BrowserManager(this);
    this.menuManager = new MenuManager(this);

    // register the schema to interceptor url
    // it should register before app ready
    this.registerNextHandler();
  }

  bootstrap = async () => {
    // make single instance
    const isSingle = app.requestSingleInstanceLock();
    if (!isSingle) app.exit(0);

    this.initDevBranding();

    // 初始化 i18n
    await this.i18n.init();

    await initIPCServer();

    //  ==============
    this.menuManager.initialize();

    await app.whenReady();

    this.browserManager.initializeBrowsers();

    app.on('window-all-closed', () => {
      if (windows()) {
        app.quit();
      }
    });

    app.on('activate', this.onActivate);
  };

  getService<T>(serviceClass: Class<T>): T {
    return this.services.get(serviceClass);
  }

  private onActivate = () => {
    this.browserManager.showMainWindow();
  };

  // ============= helper ============= //

  /**
   * all controllers in app
   */
  private controllers = new WeakMap();
  /**
   * all services in app
   */
  private services = new WeakMap();

  /**
   * webview 层 dispatch 来的事件表
   */
  private ipcClientEventMap: IPCClientEventMap = new Map();

  /**
   * use in next router interceptor in prod browser render
   */
  nextInterceptor: (params: { enabled?: boolean; session: Session }) => () => void;

  private addController = (ControllerClass: IControlModule) => {
    const controller = new ControllerClass(this);
    this.controllers.set(ControllerClass, controller);

    IoCContainer.controllers.get(ControllerClass)?.forEach((event) => {
      // 将 event 装饰器中的对象全部存到 ipcClientEventMap 中
      this.ipcClientEventMap.set(event.name, {
        controller,
        methodName: event.methodName,
      });
    });
  };

  private addService = (ServiceClass: IServiceModule) => {
    const service = new ServiceClass(this);
    this.services.set(ServiceClass, service);
  };

  private initDevBranding = () => {
    if (!isDev) return;

    app.setName('LobeHub Dev');
    if (macOS()) {
      app.dock!.setIcon(join(buildDir, 'icon-dev.png'));
    }
  };

  private registerNextHandler() {
    const handler = createHandler({
      debug: true,
      localhostUrl: this.nextServerUrl,
      protocol,
      standaloneDir: nextStandaloneDir,
    });
    console.log(
      `[APP] Server Debugging Enabled, ${this.nextServerUrl} will be intercepted to ${nextStandaloneDir}`,
    );

    this.nextInterceptor = handler.createInterceptor;
  }
}
