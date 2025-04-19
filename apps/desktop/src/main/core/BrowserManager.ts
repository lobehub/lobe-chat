import { MainBroadcastEventKey, MainBroadcastParams } from '@lobechat/electron-client-ipc';

import { createLogger } from '@/utils/logger';

import { AppBrowsersIdentifiers, appBrowsers } from '../appBrowsers';
import type { App } from './App';
import type { BrowserWindowOpts } from './Browser';
import Browser from './Browser';

// Create logger
const logger = createLogger('core:BrowserManager');

export default class BrowserManager {
  app: App;

  browsers: Map<AppBrowsersIdentifiers, Browser> = new Map();

  constructor(app: App) {
    logger.debug('Initializing BrowserManager');
    this.app = app;
  }

  getMainWindow() {
    return this.retrieveByIdentifier('chat');
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
    logger.debug(`Broadcasting event ${event} to window: ${identifier}`);
    this.browsers.get(identifier).broadcast(event, data);
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
        browser.setWindowSize({ height: 1000, width: 1400 });
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
    Object.values(appBrowsers).forEach((browser) => {
      logger.debug(`Initializing browser: ${browser.identifier}`);
      this.retrieveOrInitialize(browser);
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

    this.browsers.set(options.identifier as AppBrowsersIdentifiers, browser);

    return browser;
  }
}
