import { MainBroadcastEventKey, MainBroadcastParams } from '@lobechat/electron-client-ipc';
import { BrowserWindow, BrowserWindowConstructorOptions, ipcMain } from 'electron';
import { join } from 'node:path';

import { createLogger } from '@/utils/logger';

import { preloadDir, resourcesDir } from '../const/dir';
import type { App } from './App';

// Create logger
const logger = createLogger('core:Browser');

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
    logger.debug(`Creating Browser instance: ${options.identifier}`);
    this.app = application;
    this.identifier = options.identifier;
    this.options = options;

    // Initialization
    this.retrieveOrInitialize();
  }

  loadUrl = async (path: string) => {
    const initUrl = this.app.nextServerUrl + path;

    try {
      logger.debug(`Loading URL: ${initUrl}`);
      await this._browserWindow.loadURL(initUrl);
      logger.debug(`Successfully loaded URL: ${initUrl}`);
    } catch (error) {
      logger.error(`Failed to load URL (${initUrl}):`, error);

      // Try to load local error page
      try {
        await this._browserWindow.loadFile(join(resourcesDir, 'error.html'));
        logger.info('Error page loaded');

        // Remove previously set retry listeners to avoid duplicates

        // Set retry logic
        ipcMain.handle('retry-connection', async () => {
          logger.info(`Attempting to reconnect to: ${initUrl}`);
          try {
            await this._browserWindow?.loadURL(initUrl);
            logger.info('Reconnection successful');
            return { success: true };
          } catch (err) {
            logger.error('Retry failed:', err);
            // Reload error page
            try {
              await this._browserWindow?.loadFile(join(resourcesDir, 'error.html'));
            } catch (loadErr) {
              logger.error('Failed to load error page:', loadErr);
            }
            return { error: err.message, success: false };
          }
        });
      } catch (err) {
        logger.error('Failed to load error page:', err);
        // If even the error page can't be loaded, at least show a simple error message
        try {
          await this._browserWindow.loadURL(
            'data:text/html,<html><body><h1>Loading Failed</h1><p>Unable to connect to server, please restart the application</p></body></html>',
          );
        } catch (finalErr) {
          logger.error('Unable to display any page:', finalErr);
        }
      }
    }
  };

  loadPlaceholder = async () => {
    logger.debug('Loading splash screen');
    // First load a local HTML loading page
    await this._browserWindow.loadFile(join(resourcesDir, 'splash.html'));
  };

  show() {
    logger.debug(`Showing window: ${this.identifier}`);
    this.browserWindow.show();
  }

  hide() {
    logger.debug(`Hiding window: ${this.identifier}`);
    this.browserWindow.hide();
  }

  close() {
    logger.debug(`Closing window: ${this.identifier}`);
    this.browserWindow.close();
  }

  /**
   * Destroy instance
   */
  destroy() {
    logger.debug(`Destroying window: ${this.identifier}`);
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

    logger.info(`Creating new BrowserWindow instance: ${this.identifier}`);
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
      session: browserWindow.webContents.session,
    });

    // Windows 11 can use this new API
    if (process.platform === 'win32' && browserWindow.setBackgroundMaterial) {
      logger.debug('Setting window background material for Windows 11');
      browserWindow.setBackgroundMaterial('acrylic');
    }

    this.loadPlaceholder().then(() => {
      this.loadUrl(path).catch((e) => {
        logger.error(`Load URL error for path: ${path}`, e);
      });
    });

    // Show devtools if enabled
    if (devTools) {
      logger.debug('Opening DevTools');
      browserWindow.webContents.openDevTools();
    }

    browserWindow.once('ready-to-show', () => {
      if (showOnInit) {
        logger.debug(`Window ready to show, showing: ${this.identifier}`);
        browserWindow?.show();
      }
    });

    browserWindow.on('close', (e) => {
      logger.debug(`Window close event: ${this.identifier}`);

      // If in application quitting process, allow window to be closed
      if (this.app.isQuiting) {
        logger.debug(`App is quitting, allowing window to close: ${this.identifier}`);
        // Need to clean up intercept handler
        this.stopInterceptHandler?.();
        return;
      }

      // Prevent window from being destroyed, just hide it (if marked as keepAlive)
      if (this.options.keepAlive) {
        logger.debug(`Window needs to remain active, hiding instead: ${this.identifier}`);
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
    logger.debug(`Centering window: ${this.identifier}`);
    this._browserWindow?.center();
  }

  setWindowSize(boundSize: { height?: number; width?: number }) {
    logger.debug(
      `Setting window size for ${this.identifier}: width=${boundSize.width}, height=${boundSize.height}`,
    );
    const windowSize = this._browserWindow.getBounds();
    this._browserWindow?.setBounds({
      height: boundSize.height || windowSize.height,
      width: boundSize.width || windowSize.width,
    });
  }

  broadcast = <T extends MainBroadcastEventKey>(channel: T, data?: MainBroadcastParams<T>) => {
    logger.debug(`Broadcasting to window ${this.identifier}, channel: ${channel}`);
    this._browserWindow.webContents.send(channel, data);
  };

  toggleVisible() {
    logger.debug(`Toggling visibility for window: ${this.identifier}`);
    if (this._browserWindow.isVisible() && this._browserWindow.isFocused()) {
      this._browserWindow.hide();
    } else {
      this._browserWindow.show();
      this._browserWindow.focus();
    }
  }
}
