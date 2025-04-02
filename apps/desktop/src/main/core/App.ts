import { Session, app, ipcMain, protocol } from 'electron';
import { macOS, windows } from 'electron-is';
import { createHandler } from 'next-electron-rsc';
import { join } from 'node:path';

import * as appBrowsers from '../appBrowsers';
import { buildDir, nextStandaloneDir } from '../const/dir';
import { isDev } from '../const/env';
import { IControlModule } from '../controllers';
import BrowserManager from './BrowserManager';
import { initIPCServer } from './IPCServer';
import { IoCContainer } from './IoCContainer';

export type IPCClientEventMap = Map<string, any>;

const importAll = (r: any) => Object.values(r).map((v: any) => v.default);

export class App {
  /**
   * all controllers in app
   */
  private controllers = new WeakMap();
  nextServerUrl = 'http://localhost:3010';

  /**
   * 承接 webview fetch 的事件表
   */
  private ipcClientEventMap: IPCClientEventMap = new Map();
  browserManager: BrowserManager;
  nextInterceptor: ({ session }: { session: Session }) => () => void;

  constructor() {
    // load controllers
    const controllers: IControlModule[] = importAll(
      // @ts-ignore
      import.meta.glob('../controllers/*Ctr.ts', { eager: true }),
    );

    controllers.forEach((service) => this.addController(service));

    // 批量注册 controller 中 event 事件 供 render 端消费
    this.ipcClientEventMap.forEach((serviceInfo, key) => {
      // 获取相应方法
      const { service, methodName } = serviceInfo;

      ipcMain.handle(key, async (e, ...data) => {
        try {
          return await service[methodName](...data);
        } catch (error) {
          return { error: error.message };
        }
      });
    });

    this.browserManager = new BrowserManager(this);
  }

  private onActivate = () => {
    this.browserManager.showMainWindow();
  };

  bootstrap = async () => {
    // make single instance
    const isSingle = app.requestSingleInstanceLock();
    if (!isSingle) app.exit(0);

    this.initDevBranding();

    //  ==============
    await initIPCServer();

    // register the schema to interceptor url
    // it should register before app ready
    this.registerNextHandler();

    await app.whenReady();

    app.on('ready', async () => {
      this.initBrowsers();
    });

    app.on('window-all-closed', () => {
      if (windows()) {
        app.quit();
      }
    });

    app.on('activate', this.onActivate);
  };

  private addController = (ControllerClass: IControlModule) => {
    const service = new ControllerClass(this);
    this.controllers.set(ControllerClass, service);

    IoCContainer.controllers.get(ControllerClass)?.forEach((event) => {
      // 将 event 装饰器中的对象全部存到 ipcClientEventMap 中
      this.ipcClientEventMap.set(event.name, {
        methodName: event.methodName,
        service,
      });
    });
  };

  private initDevBranding = () => {
    if (!isDev) return;

    app.setName('LobeHub Dev');
    if (macOS()) {
      app.dock!.setIcon(join(buildDir, 'icon-dev.png'));
    }
  };

  /**
   * 添加窗口

   */
  private initBrowsers() {
    Object.values(appBrowsers).forEach((item) => {
      this.browserManager.retrieveOrInitialize(item);
    });
  }

  private registerNextHandler() {
    if (isDev) return;

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
