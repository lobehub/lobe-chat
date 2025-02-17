import { BrowserWindow, BrowserWindowConstructorOptions, ipcMain } from 'electron';
import { join } from 'node:path';

import { isDev } from '@/const/env';

import { preloadDir, resourcesDir } from '../const/dir';
import type { App } from './App';

export interface BrowserWindowOpts extends BrowserWindowConstructorOptions {
  devTools?: boolean;
  height?: number;
  /**
   * URL
   */
  identifier: string;
  keepAlive?: boolean;
  path: string;
  showOnInit?: boolean;
  title?: string;
  width?: number;
}

export default class Browser {
  private app: App;

  /**
   * 内部的 electron 窗口
   */
  private _browserWindow?: BrowserWindow;

  private stopInterceptHandler;
  /**
   * 标识符
   */
  identifier: string;

  /**
   * 生成时的选项
   */
  options: BrowserWindowOpts;

  /**
   * 对外暴露的获取窗口的方法
   */
  get browserWindow() {
    return this.retrieveOrInitialize();
  }

  /**
   * 构建 BrowserWindows 对象的方法
   * @param options
   * @param application
   */
  constructor(options: BrowserWindowOpts, application: App) {
    this.app = application;
    this.identifier = options.identifier;
    this.options = options;

    // 初始化
    this.retrieveOrInitialize();
  }

  loadUrl = async (path: string) => {
    const initUrl = this.app.nextServerUrl + path;

    try {
      await this._browserWindow.loadURL(initUrl);
      console.log('[APP] Loaded', initUrl);
    } catch (error) {
      console.error('[APP] Failed to load URL:', error);

      // 加载本地错误页面
      await this._browserWindow.loadFile(join(resourcesDir, 'error.html'));

      // 设置简单的重试逻辑
      ipcMain.on('retry-connection', async () => {
        try {
          await this._browserWindow?.loadURL(initUrl);
          console.log('[APP] Reconnected successfully');
        } catch (err) {
          console.error('[APP] Retry failed:', err);
          // 重新加载错误页面，重置状态
          this._browserWindow?.loadFile(join(resourcesDir, 'error.html'));
        }
      });
    }
  };

  loadPlaceholder = async () => {
    // 首先加载一个本地的HTML加载页面
    await this._browserWindow.loadFile(join(resourcesDir, 'splash.html'));
  };

  show() {
    this.browserWindow.show();
  }

  hide() {
    this.browserWindow.hide();
  }

  /**
   * 销毁实例
   */
  destroy() {
    this.stopInterceptHandler?.();
    this._browserWindow = undefined;
  }

  /**
   * 初始化
   */
  retrieveOrInitialize() {
    // 当有这个窗口 且这个窗口没有被注销时
    if (this._browserWindow && !this._browserWindow.isDestroyed()) {
      return this._browserWindow;
    }

    const { path, title, width, height, devTools, showOnInit, ...res } = this.options;

    const browserWindow = new BrowserWindow({
      ...res,
      height,
      show: false,
      title,
      transparent: true,
      webPreferences: {
        // 上下文隔离环境
        // https://www.electronjs.org/docs/tutorial/context-isolation
        contextIsolation: true,
        preload: join(preloadDir, 'index.js'),
        // devTools: isDev,
      },
      width,
    });

    this._browserWindow = browserWindow;

    this.stopInterceptHandler = this.app.nextInterceptor({
      enabled: !isDev,
      session: browserWindow.webContents.session,
    });

    // Windows 11 可以使用这个新 API
    if (process.platform === 'win32' && browserWindow.setBackgroundMaterial) {
      browserWindow.setBackgroundMaterial('acrylic');
    }

    this.loadPlaceholder().then(() => {
      this.loadUrl(path).catch((e) => {
        console.error(`load url error, ${path}`, e);
      });
    });

    // 显示 devtools 就打开
    if (devTools) {
      browserWindow.webContents.openDevTools();
    }

    browserWindow.once('ready-to-show', () => {
      if (showOnInit) browserWindow?.show();
    });

    browserWindow.on('close', () => {
      // the ones who need keepAlive won't be destroyed
      this.stopInterceptHandler?.();
      if (this.options.keepAlive) {
        console.log('need to handle');
        // e.preventDefault();
        // browserWindow.hide();
      }
    });

    return browserWindow;
  }
}
