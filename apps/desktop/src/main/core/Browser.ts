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
      console.log(`[Browser] loading ${initUrl}`);
      await this._browserWindow.loadURL(initUrl);
      console.log(`[Browser] loaded ${initUrl}`);
    } catch (error) {
      console.error(`[Browser] failed to load (${initUrl}):`, error);

      // 尝试加载本地错误页面
      try {
        await this._browserWindow.loadFile(join(resourcesDir, 'error.html'));
        console.log('[APP] 已加载错误页面');

        // 移除之前可能设置的重试监听器，避免重复添加
        ipcMain.removeAllListeners('retry-connection');

        // 设置重试逻辑
        ipcMain.on('retry-connection', async () => {
          console.log(`[APP] 尝试重新连接 ${initUrl}`);
          try {
            await this._browserWindow?.loadURL(initUrl);
            console.log('[APP] 重新连接成功');
          } catch (err) {
            console.error('[APP] 重试失败:', err);
            // 重新加载错误页面
            try {
              await this._browserWindow?.loadFile(join(resourcesDir, 'error.html'));
            } catch (loadErr) {
              console.error('[APP] 加载错误页面失败:', loadErr);
            }
          }
        });
      } catch (err) {
        console.error('[APP] 加载错误页面失败:', err);
        // 如果连错误页面都加载不了，我们至少显示一个简单的错误信息
        try {
          await this._browserWindow.loadURL(
            'data:text/html,<html><body><h1>加载失败</h1><p>无法连接到服务器，请重启应用</p></body></html>',
          );
        } catch (finalErr) {
          console.error('[APP] 无法显示任何页面:', finalErr);
        }
      }
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

    console.log(`[Browser] create new Browser instance: ${this.identifier}`);
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

    browserWindow.on('close', (e) => {
      console.log(`[Browser] 窗口关闭事件: ${this.identifier}`);

      // 阻止窗口被销毁，只隐藏它 (若标记为 keepAlive)
      if (this.options.keepAlive) {
        console.log(`[Browser] 窗口需要保持活跃状态: ${this.identifier}`);
        e.preventDefault();
        browserWindow.hide();
      } else {
        // 需要清理拦截处理器
        this.stopInterceptHandler?.();
      }
    });

    return browserWindow;
  }
}
