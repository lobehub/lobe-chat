import { MainBroadcastEventKey, MainBroadcastParams } from '@lobechat/electron-client-ipc';
import { WebContents } from 'electron';

import { DEFAULT_WINDOW_CONFIG } from '@/const/theme';
import { createLogger } from '@/utils/logger';

import { AppBrowsersIdentifiers, appBrowsers } from '../../appBrowsers';
import type { App } from '../App';
import type { BrowserWindowOpts } from './Browser';
import { Browser } from './Browser';

// Create logger
const logger = createLogger('core:BrowserManager');

export class BrowserManager {
  app: App;

  browsers: Map<AppBrowsersIdentifiers, Browser> = new Map();

  private webContentsMap = new Map<WebContents, AppBrowsersIdentifiers>();

  constructor(app: App) {
    logger.debug('Initializing BrowserManager');
    this.app = app;
  }

  getMainWindow(): Browser | null {
    return this.browsers.get('chat') || null;
  }

  showMainWindow() {
    logger.debug('Showing main window');
    const window = this.getMainWindow();
    window.show();
  }

  showSettingsWindow() {
    logger.debug('Showing settings window');
    const window = this.retrieveByIdentifier('settings');
    window.show();
    return window;
  }

  broadcastToAllWindows = <T extends MainBroadcastEventKey>(
    event: T,
    data: MainBroadcastParams<T>,
  ) => {
    logger.debug(`Broadcasting event ${event} to all windows`);
    this.browsers.forEach((browser) => {
      browser.broadcast(event, data);
    });
  };

  broadcastToWindow = <T extends MainBroadcastEventKey>(
    identifier: AppBrowsersIdentifiers,
    event: T,
    data: MainBroadcastParams<T>,
  ) => {
    const browser = this.browsers.get(identifier);
    if (!browser) {
      logger.warn(`Cannot broadcast to non-existent window: ${identifier}`);
      return;
    }

    logger.debug(`Broadcasting event ${event} to window: ${identifier}`);
    browser.broadcast(event, data);
  };

  /**
   * Display the settings window and navigate to a specific tab
   * @param tab Settings window sub-path tab
   */
  async showSettingsWindowWithTab(tab?: string) {
    logger.debug(`Showing settings window with tab: ${tab || 'default'}`);
    // common is the main path for settings route
    if (tab && tab !== 'common') {
      const browser = await this.redirectToPage('settings', tab);

      // make provider page more large
      if (tab.startsWith('provider/')) {
        logger.debug('Resizing window for provider settings');
        browser.setWindowSize({
          height: DEFAULT_WINDOW_CONFIG.PROVIDER_WINDOW.HEIGHT,
          width: DEFAULT_WINDOW_CONFIG.PROVIDER_WINDOW.WIDTH,
        });
        browser.moveToCenter();
      }

      return browser;
    } else {
      return this.showSettingsWindow();
    }
  }

  /**
   * Navigate window to specific sub-path
   * @param identifier Window identifier
   * @param subPath Sub-path, such as 'agent', 'about', etc.
   */
  async redirectToPage(identifier: AppBrowsersIdentifiers, subPath?: string) {
    try {
      // Ensure window is retrieved or created
      const browser = this.retrieveByIdentifier(identifier);
      browser.hide();

      const baseRoute = appBrowsers[identifier].path;

      // Build complete URL path
      const fullPath = subPath ? `${baseRoute}/${subPath}` : baseRoute;

      logger.debug(`Redirecting to: ${fullPath}`);

      // Load URL and show window
      await browser.loadUrl(fullPath);
      browser.show();

      return browser;
    } catch (error) {
      logger.error(`Failed to redirect (${identifier}/${subPath}):`, error);
      throw error;
    }
  }

  /**
   * get Browser by identifier
   */
  retrieveByIdentifier(identifier: AppBrowsersIdentifiers) {
    const browser = this.browsers.get(identifier);

    if (browser) return browser;

    logger.debug(`Browser ${identifier} not found, initializing new instance`);
    return this.retrieveOrInitialize(appBrowsers[identifier]);
  }

  /**
   * Initialize all browsers when app starts up
   */
  initializeBrowsers() {
    logger.info('Initializing all browsers');
    Object.values(appBrowsers).forEach((browser: BrowserWindowOpts) => {
      logger.debug(`Initializing browser: ${browser.identifier}`);

      if (browser.keepAlive) {
        this.retrieveOrInitialize(browser);
      }
    });
  }

  // helper

  /**
   * Retrieve existing browser or initialize a new one
   * @param options Browser window options
   */
  private retrieveOrInitialize(options: BrowserWindowOpts) {
    let browser = this.browsers.get(options.identifier as AppBrowsersIdentifiers);
    if (browser) {
      logger.debug(`Retrieved existing browser: ${options.identifier}`);
      return browser;
    }

    logger.debug(`Creating new browser: ${options.identifier}`);
    browser = new Browser(options, this.app);

    const identifier = options.identifier as AppBrowsersIdentifiers;
    this.browsers.set(identifier, browser);

    // Set up WebContents mapping
    this.setupWebContentsMapping(browser, identifier);

    return browser;
  }

  closeWindow(identifier: string) {
    const browser = this.browsers.get(identifier as AppBrowsersIdentifiers);
    if (!browser) {
      logger.warn(`Cannot close non-existent window: ${identifier}`);
      return;
    }
    browser.close();
  }

  minimizeWindow(identifier: string) {
    const browser = this.browsers.get(identifier as AppBrowsersIdentifiers);
    if (!browser) {
      logger.warn(`Cannot minimize non-existent window: ${identifier}`);
      return;
    }
    browser.browserWindow.minimize();
  }

  maximizeWindow(identifier: string) {
    const browser = this.browsers.get(identifier as AppBrowsersIdentifiers);
    if (!browser) {
      logger.warn(`Cannot maximize non-existent window: ${identifier}`);
      return;
    }

    const window = browser.browserWindow;
    if (window.isMaximized()) {
      window.unmaximize();
    } else {
      window.maximize();
    }
  }

  /**
   * Check if a window exists and is not destroyed
   */
  isWindowValid(identifier: AppBrowsersIdentifiers): boolean {
    const browser = this.browsers.get(identifier);
    return browser ? !browser.browserWindow.isDestroyed() : false;
  }

  /**
   * Get all active window identifiers
   */
  getActiveWindowIdentifiers(): AppBrowsersIdentifiers[] {
    return Array.from(this.browsers.keys()).filter((id) => this.isWindowValid(id));
  }

  getIdentifierByWebContents(webContents: WebContents): AppBrowsersIdentifiers | null {
    return this.webContentsMap.get(webContents) || null;
  }

  private setupWebContentsMapping(browser: Browser, identifier: AppBrowsersIdentifiers): void {
    // Record WebContents and identifier mapping
    this.webContentsMap.set(browser.browserWindow.webContents, identifier);

    // Clean up mapping when window closes
    browser.browserWindow.on('close', () => {
      if (browser.webContents) {
        this.webContentsMap.delete(browser.webContents);
      }
    });

    // Update mapping when window shows (in case WebContents changes)
    browser.browserWindow.on('show', () => {
      if (browser.webContents) {
        this.webContentsMap.set(browser.webContents, identifier);
      }
    });
  }
}
