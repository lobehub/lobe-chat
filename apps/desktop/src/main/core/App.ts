import { ElectronIPCEventHandler, ElectronIPCServer } from '@lobechat/electron-server-ipc';
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
import { IoCContainer } from './IoCContainer';
import MenuManager from './MenuManager';
import { ShortcutManager } from './ShortcutManager';
import { StoreManager } from './StoreManager';
import { UpdaterManager } from './UpdaterManager';

export type IPCEventMap = Map<string, { controller: any; methodName: string }>;
export type ShortcutMethodMap = Map<string, () => Promise<void>>;

type Class<T> = new (...args: any[]) => T;

const importAll = (r: any) => Object.values(r).map((v: any) => v.default);

export class App {
  nextServerUrl = 'http://localhost:3015';

  browserManager: BrowserManager;
  menuManager: MenuManager;
  i18n: I18nManager;
  storeManager: StoreManager;
  updaterManager: UpdaterManager;
  shortcutManager: ShortcutManager;

  /**
   * whether app is in quiting
   */
  isQuiting: boolean = false;

  constructor() {
    // 初始化存储管理器
    this.storeManager = new StoreManager(this);

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

    this.initializeIPCEvents();

    this.i18n = new I18nManager(this);
    this.browserManager = new BrowserManager(this);
    this.menuManager = new MenuManager(this);
    this.updaterManager = new UpdaterManager(this);
    this.shortcutManager = new ShortcutManager(this);

    // register the schema to interceptor url
    // it should register before app ready
    this.registerNextHandler();
  }

  bootstrap = async () => {
    // make single instance
    const isSingle = app.requestSingleInstanceLock();
    if (!isSingle) app.exit(0);

    this.initDevBranding();

    //  ==============
    await this.ipcServer.start();

    await app.whenReady();

    // 初始化 i18n. PS: app.getLocale() 必须在 app.whenReady() 之后调用才能拿到正确的值
    await this.i18n.init();
    this.menuManager.initialize();

    // 初始化全局快捷键: globalShortcut  必须在 app.whenReady() 之后调用
    this.shortcutManager.initialize();

    this.browserManager.initializeBrowsers();

    // 初始化更新管理器
    await this.updaterManager.initialize();

    // 添加全局应用退出状态
    this.isQuiting = false;

    // 监听 before-quit 事件，设置退出标志
    app.on('before-quit', () => {
      this.isQuiting = true;
      // 在应用退出前注销所有快捷键
      this.shortcutManager.unregisterAll();
    });

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

  private ipcServer: ElectronIPCServer;
  /**
   * webview 层 dispatch 来的事件表
   */
  private ipcClientEventMap: IPCEventMap = new Map();
  private ipcServerEventMap: IPCEventMap = new Map();
  shortcutMethodMap: ShortcutMethodMap = new Map();

  /**
   * use in next router interceptor in prod browser render
   */
  nextInterceptor: (params: { enabled?: boolean; session: Session }) => () => void;

  private addController = (ControllerClass: IControlModule) => {
    const controller = new ControllerClass(this);
    this.controllers.set(ControllerClass, controller);

    IoCContainer.controllers.get(ControllerClass)?.forEach((event) => {
      if (event.mode === 'client') {
        // 将 event 装饰器中的对象全部存到 ipcClientEventMap 中
        this.ipcClientEventMap.set(event.name, {
          controller,
          methodName: event.methodName,
        });
      }

      if (event.mode === 'server') {
        // 将 event 装饰器中的对象全部存到 ipcServerEventMap 中
        this.ipcServerEventMap.set(event.name, {
          controller,
          methodName: event.methodName,
        });
      }
    });

    IoCContainer.shortcuts.get(ControllerClass)?.forEach((shortcut) => {
      this.shortcutMethodMap.set(shortcut.name, async () => {
        controller[shortcut.methodName]();
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

  private initializeIPCEvents() {
    // 批量注册 controller 中 client event 事件 供 render 端消费
    this.ipcClientEventMap.forEach((eventInfo, key) => {
      const { controller, methodName } = eventInfo;

      ipcMain.handle(key, async (e, ...data) => {
        try {
          return await controller[methodName](...data);
        } catch (error) {
          return { error: error.message };
        }
      });
    });

    // 批量注册 controller 中的 server event 事件 供 next server 端消费
    const ipcServerEvents = {} as ElectronIPCEventHandler;

    this.ipcServerEventMap.forEach((eventInfo, key) => {
      const { controller, methodName } = eventInfo;

      ipcServerEvents[key] = async (payload) => {
        try {
          return await controller[methodName](payload);
        } catch (error) {
          return { error: error.message };
        }
      };
    });

    this.ipcServer = new ElectronIPCServer(ipcServerEvents);
  }
}
