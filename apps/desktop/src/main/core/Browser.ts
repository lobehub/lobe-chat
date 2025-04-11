import { MainBroadcastEventKey, MainBroadcastParams } from '@lobechat/electron-client-ipc';
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
   * Internal electron window
   */
  private _browserWindow?: BrowserWindow;

  private stopInterceptHandler;
  /**
   * Identifier
   */
  identifier: string;

  /**
   * Options at creation
   */
  options: BrowserWindowOpts;

  /**
   * Method to expose window externally
   */
  get browserWindow() {
    return this.retrieveOrInitialize();
  }

  /**
   * Method to construct BrowserWindows object
   * @param options
   * @param application
   */
  constructor(options: BrowserWindowOpts, application: App) {
    this.app = application;
    this.identifier = options.identifier;
    this.options = options;

    // Initialization
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

      // Try to load local error page
      try {
        await this._browserWindow.loadFile(join(resourcesDir, 'error.html'));
        console.log('[APP] Error page loaded');

        // Remove previously set retry listeners to avoid duplicates

        // Set retry logic
        ipcMain.handle('retry-connection', async () => {
          console.log(`[APP] Attempting to reconnect ${initUrl}`);
          try {
            await this._browserWindow?.loadURL(initUrl);
            console.log('[APP] Reconnection successful');
            return { success: true };
          } catch (err) {
            console.error('[APP] Retry failed:', err);
            // Reload error page
            try {
              await this._browserWindow?.loadFile(join(resourcesDir, 'error.html'));
            } catch (loadErr) {
              console.error('[APP] Failed to load error page:', loadErr);
            }
            return { error: err.message, success: false };
          }
        });
      } catch (err) {
        console.error('[APP] Failed to load error page:', err);
        // If even the error page can't be loaded, at least show a simple error message
        try {
          await this._browserWindow.loadURL(
            'data:text/html,<html><body><h1>Loading Failed</h1><p>Unable to connect to server, please restart the application</p></body></html>',
          );
        } catch (finalErr) {
          console.error('[APP] Unable to display any page:', finalErr);
        }
      }
    }
  };

  loadPlaceholder = async () => {
    // First load a local HTML loading page
    await this._browserWindow.loadFile(join(resourcesDir, 'splash.html'));
  };

  show() {
    this.browserWindow.show();
  }

  hide() {
    this.browserWindow.hide();
  }

  close() {
    this.browserWindow.close();
  }

  /**
   * Destroy instance
   */
  destroy() {
    this.stopInterceptHandler?.();
    this._browserWindow = undefined;
  }

  /**
   * Initialize
   */
  retrieveOrInitialize() {
    // When there is this window and it has not been destroyed
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
        // Context isolation environment
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

    // Windows 11 can use this new API
    if (process.platform === 'win32' && browserWindow.setBackgroundMaterial) {
      browserWindow.setBackgroundMaterial('acrylic');
    }

    this.loadPlaceholder().then(() => {
      this.loadUrl(path).catch((e) => {
        console.error(`load url error, ${path}`, e);
      });
    });

    // Show devtools if enabled
    if (devTools) {
      browserWindow.webContents.openDevTools();
    }

    browserWindow.once('ready-to-show', () => {
      if (showOnInit) browserWindow?.show();
    });

    browserWindow.on('close', (e) => {
      console.log(`[Browser] Window close event: ${this.identifier}`);

      // If in application quitting process, allow window to be closed
      if (this.app.isQuiting) {
        // Need to clean up intercept handler
        this.stopInterceptHandler?.();
        return;
      }

      // Prevent window from being destroyed, just hide it (if marked as keepAlive)
      if (this.options.keepAlive) {
        console.log(`[Browser] Window needs to remain active: ${this.identifier}`);
        e.preventDefault();
        browserWindow.hide();
      } else {
        // Need to clean up intercept handler
        this.stopInterceptHandler?.();
      }
    });

    return browserWindow;
  }

  moveToCenter() {
    this._browserWindow?.center();
  }

  setWindowSize(boundSize: { height?: number; width?: number }) {
    const windowSize = this._browserWindow.getBounds();
    this._browserWindow?.setBounds({
      height: boundSize.height || windowSize.height,
      width: boundSize.width || windowSize.width,
    });
  }

  broadcast = <T extends MainBroadcastEventKey>(channel: T, data?: MainBroadcastParams<T>) => {
    this._browserWindow.webContents.send(channel, data);
  };

  toggleVisible() {
    if (this._browserWindow.isVisible() && this._browserWindow.isFocused()) {
      this._browserWindow.hide();
    } else {
      this._browserWindow.show();
      this._browserWindow.focus();
    }
  }
}
