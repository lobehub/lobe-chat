import { MainBroadcastEventKey, MainBroadcastParams } from '@lobechat/electron-client-ipc';
import {
  BrowserWindow,
  BrowserWindowConstructorOptions,
  ipcMain,
  nativeTheme,
  screen,
} from 'electron';
import os from 'node:os';
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
  parentIdentifier?: string;
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
   * Key for storing window state in storeManager
   */
  private readonly windowStateKey: string;

  /**
   * Method to expose window externally
   */
  get browserWindow() {
    return this.retrieveOrInitialize();
  }

  get webContents() {
    if (this._browserWindow.isDestroyed()) return null;

    return this._browserWindow.webContents;
  }

  /**
   * Method to construct BrowserWindows object
   * @param options
   * @param application
   */
  constructor(options: BrowserWindowOpts, application: App) {
    logger.debug(`Creating Browser instance: ${options.identifier}`);
    logger.debug(`Browser options: ${JSON.stringify(options)}`);
    this.app = application;
    this.identifier = options.identifier;
    this.options = options;
    this.windowStateKey = `windowSize_${this.identifier}`;

    // Initialization
    this.retrieveOrInitialize();
  }

  loadUrl = async (path: string) => {
    const initUrl = this.app.nextServerUrl + path;

    try {
      logger.debug(`[${this.identifier}] Attempting to load URL: ${initUrl}`);
      await this._browserWindow.loadURL(initUrl);
      logger.debug(`[${this.identifier}] Successfully loaded URL: ${initUrl}`);
    } catch (error) {
      logger.error(`[${this.identifier}] Failed to load URL (${initUrl}):`, error);

      // Try to load local error page
      try {
        logger.info(`[${this.identifier}] Attempting to load error page...`);
        await this._browserWindow.loadFile(join(resourcesDir, 'error.html'));
        logger.info(`[${this.identifier}] Error page loaded successfully.`);

        // Remove previously set retry listeners to avoid duplicates
        ipcMain.removeHandler('retry-connection');
        logger.debug(`[${this.identifier}] Removed existing retry-connection handler if any.`);

        // Set retry logic
        ipcMain.handle('retry-connection', async () => {
          logger.info(`[${this.identifier}] Retry connection requested for: ${initUrl}`);
          try {
            await this._browserWindow?.loadURL(initUrl);
            logger.info(`[${this.identifier}] Reconnection successful to ${initUrl}`);
            return { success: true };
          } catch (err) {
            logger.error(`[${this.identifier}] Retry connection failed for ${initUrl}:`, err);
            // Reload error page
            try {
              logger.info(`[${this.identifier}] Reloading error page after failed retry...`);
              await this._browserWindow?.loadFile(join(resourcesDir, 'error.html'));
              logger.info(`[${this.identifier}] Error page reloaded.`);
            } catch (loadErr) {
              logger.error('[${this.identifier}] Failed to reload error page:', loadErr);
            }
            return { error: err.message, success: false };
          }
        });
        logger.debug(`[${this.identifier}] Set up retry-connection handler.`);
      } catch (err) {
        logger.error(`[${this.identifier}] Failed to load error page:`, err);
        // If even the error page can't be loaded, at least show a simple error message
        try {
          logger.warn(`[${this.identifier}] Attempting to load fallback error HTML string...`);
          await this._browserWindow.loadURL(
            'data:text/html,<html><body><h1>Loading Failed</h1><p>Unable to connect to server, please restart the application</p></body></html>',
          );
          logger.info(`[${this.identifier}] Fallback error HTML string loaded.`);
        } catch (finalErr) {
          logger.error(`[${this.identifier}] Unable to display any page:`, finalErr);
        }
      }
    }
  };

  loadPlaceholder = async () => {
    logger.debug(`[${this.identifier}] Loading splash screen placeholder`);
    // First load a local HTML loading page
    await this._browserWindow.loadFile(join(resourcesDir, 'splash.html'));
    logger.debug(`[${this.identifier}] Splash screen placeholder loaded.`);
  };

  show() {
    logger.debug(`Showing window: ${this.identifier}`);
    this.determineWindowPosition();
    this.browserWindow.show();
  }

  private determineWindowPosition() {
    const { parentIdentifier } = this.options;

    if (parentIdentifier) {
      // todo: fix ts type
      const parentWin = this.app.browserManager.retrieveByIdentifier(parentIdentifier as any);
      if (parentWin) {
        logger.debug(`[${this.identifier}] Found parent window: ${parentIdentifier}`);

        const display = screen.getDisplayNearestPoint(parentWin.browserWindow.getContentBounds());
        if (display) {
          const {
            workArea: { x, y, width: displayWidth, height: displayHeight },
          } = display;

          const { width, height } = this._browserWindow.getContentBounds();
          logger.debug(
            `[${this.identifier}] Display bounds: x=${x}, y=${y}, width=${displayWidth}, height=${displayHeight}`,
          );

          // Calculate new position
          const newX = Math.floor(Math.max(x + (displayWidth - width) / 2, x));
          const newY = Math.floor(Math.max(y + (displayHeight - height) / 2, y));
          logger.debug(`[${this.identifier}] Calculated position: x=${newX}, y=${newY}`);
          this._browserWindow.setPosition(newX, newY, false);
        }
      }
    }
  }

  hide() {
    logger.debug(`Hiding window: ${this.identifier}`);
    this.browserWindow.hide();
  }

  close() {
    logger.debug(`Attempting to close window: ${this.identifier}`);
    this.browserWindow.close();
  }

  /**
   * Destroy instance
   */
  destroy() {
    logger.debug(`Destroying window instance: ${this.identifier}`);
    this.stopInterceptHandler?.();
    this._browserWindow = undefined;
  }

  /**
   * Initialize
   */
  retrieveOrInitialize() {
    // When there is this window and it has not been destroyed
    if (this._browserWindow && !this._browserWindow.isDestroyed()) {
      logger.debug(`[${this.identifier}] Returning existing BrowserWindow instance.`);
      return this._browserWindow;
    }

    const { path, title, width, height, devTools, showOnInit, ...res } = this.options;

    // Load window state
    const savedState = this.app.storeManager.get(this.windowStateKey as any) as
      | { height?: number; width?: number }
      | undefined; // Keep type for now, but only use w/h
    logger.info(`Creating new BrowserWindow instance: ${this.identifier}`);
    logger.debug(`[${this.identifier}] Options for new window: ${JSON.stringify(this.options)}`);
    logger.debug(
      `[${this.identifier}] Saved window state (only size used): ${JSON.stringify(savedState)}`,
    );

    const { isWindows11, isWindows } = this.getWindowsVersion();
    const isDarkMode = nativeTheme.shouldUseDarkColors;

    const browserWindow = new BrowserWindow({
      ...res,
      ...(isWindows
        ? {
            titleBarStyle: 'hidden',
          }
        : {}),
      ...(isWindows11
        ? {
            backgroundMaterial: isDarkMode ? 'mica' : 'acrylic',
            vibrancy: 'under-window',
            visualEffectState: 'active',
          }
        : {}),
      autoHideMenuBar: true,
      backgroundColor: '#00000000',
      frame: false,

      height: savedState?.height || height,
      // Always create hidden first
      show: false,
      title,

      webPreferences: {
        // Context isolation environment
        // https://www.electronjs.org/docs/tutorial/context-isolation
        contextIsolation: true,
        preload: join(preloadDir, 'index.js'),
      },
      width: savedState?.width || width,
    });

    this._browserWindow = browserWindow;
    logger.debug(`[${this.identifier}] BrowserWindow instance created.`);

    if (isWindows11) this.applyVisualEffects();

    logger.debug(`[${this.identifier}] Setting up nextInterceptor.`);
    this.stopInterceptHandler = this.app.nextInterceptor({
      session: browserWindow.webContents.session,
    });

    logger.debug(`[${this.identifier}] Initiating placeholder and URL loading sequence.`);
    this.loadPlaceholder().then(() => {
      this.loadUrl(path).catch((e) => {
        logger.error(`[${this.identifier}] Initial loadUrl error for path '${path}':`, e);
      });
    });

    // Show devtools if enabled
    if (devTools) {
      logger.debug(`[${this.identifier}] Opening DevTools because devTools option is true.`);
      browserWindow.webContents.openDevTools();
    }

    logger.debug(`[${this.identifier}] Setting up 'ready-to-show' event listener.`);
    browserWindow.once('ready-to-show', () => {
      logger.debug(`[${this.identifier}] Window 'ready-to-show' event fired.`);
      if (showOnInit) {
        logger.debug(`Showing window ${this.identifier} because showOnInit is true.`);
        browserWindow?.show();
      } else {
        logger.debug(
          `Window ${this.identifier} not shown on 'ready-to-show' because showOnInit is false.`,
        );
      }
    });

    logger.debug(`[${this.identifier}] Setting up 'close' event listener.`);
    browserWindow.on('close', (e) => {
      logger.debug(`Window 'close' event triggered for: ${this.identifier}`);
      logger.debug(
        `[${this.identifier}] State during close event: isQuiting=${this.app.isQuiting}, keepAlive=${this.options.keepAlive}`,
      );

      // If in application quitting process, allow window to be closed
      if (this.app.isQuiting) {
        logger.debug(`[${this.identifier}] App is quitting, allowing window to close naturally.`);
        // Save state before quitting
        try {
          const { width, height } = browserWindow.getBounds(); // Get only width and height
          const sizeState = { height, width };
          logger.debug(
            `[${this.identifier}] Saving window size on quit: ${JSON.stringify(sizeState)}`,
          );
          this.app.storeManager.set(this.windowStateKey as any, sizeState); // Save only size
        } catch (error) {
          logger.error(`[${this.identifier}] Failed to save window state on quit:`, error);
        }
        // Need to clean up intercept handler
        this.stopInterceptHandler?.();
        return;
      }

      // Prevent window from being destroyed, just hide it (if marked as keepAlive)
      if (this.options.keepAlive) {
        logger.debug(
          `[${this.identifier}] keepAlive is true, preventing default close and hiding window.`,
        );
        // Optionally save state when hiding if desired, but primary save is on actual close/quit
        // try {
        //   const bounds = browserWindow.getBounds();
        //   logger.debug(`[${this.identifier}] Saving window state on hide: ${JSON.stringify(bounds)}`);
        //   this.app.storeManager.set(this.windowStateKey, bounds);
        // } catch (error) {
        //   logger.error(`[${this.identifier}] Failed to save window state on hide:`, error);
        // }
        e.preventDefault();
        browserWindow.hide();
      } else {
        // Window is actually closing (not keepAlive)
        logger.debug(
          `[${this.identifier}] keepAlive is false, allowing window to close. Saving size...`, // Updated log message
        );
        try {
          const { width, height } = browserWindow.getBounds(); // Get only width and height
          const sizeState = { height, width };
          logger.debug(
            `[${this.identifier}] Saving window size on close: ${JSON.stringify(sizeState)}`,
          );
          this.app.storeManager.set(this.windowStateKey as any, sizeState); // Save only size
        } catch (error) {
          logger.error(`[${this.identifier}] Failed to save window state on close:`, error);
        }
        // Need to clean up intercept handler
        this.stopInterceptHandler?.();
      }
    });

    logger.debug(`[${this.identifier}] retrieveOrInitialize completed.`);
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

  applyVisualEffects() {
    // Windows 11 can use this new API
    if (this._browserWindow) {
      logger.debug(`[${this.identifier}] Setting window background material for Windows 11`);
      const isDarkMode = nativeTheme.shouldUseDarkColors;
      this._browserWindow?.setBackgroundMaterial(isDarkMode ? 'mica' : 'acrylic');
      this._browserWindow?.setVibrancy('under-window');
    }
  }

  toggleVisible() {
    logger.debug(`Toggling visibility for window: ${this.identifier}`);
    if (this._browserWindow.isVisible() && this._browserWindow.isFocused()) {
      this._browserWindow.hide();
    } else {
      this._browserWindow.show();
      this._browserWindow.focus();
    }
  }

  getWindowsVersion() {
    if (process.platform !== 'win32') {
      return {
        isWindows: false,
        isWindows10: false,
        isWindows11: false,
        version: null,
      };
    }

    // 获取操作系统版本（如 "10.0.22621"）
    const release = os.release();
    const parts = release.split('.');

    // 主版本和次版本
    const majorVersion = parseInt(parts[0], 10);
    const minorVersion = parseInt(parts[1], 10);

    // 构建号是第三部分
    const buildNumber = parseInt(parts[2], 10);

    // Windows 11 的构建号从 22000 开始
    const isWindows11 = majorVersion === 10 && minorVersion === 0 && buildNumber >= 22_000;

    return {
      buildNumber,
      isWindows: true,
      isWindows11,
      version: release,
    };
  }
}
