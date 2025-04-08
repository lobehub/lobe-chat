import { MainBroadcastEventKey, MainBroadcastParams } from '@lobechat/electron-client-ipc';

import { AppBrowsersIdentifiers, appBrowsers } from '../appBrowsers';
import type { App } from './App';
import type { BrowserWindowOpts } from './Browser';
import Browser from './Browser';

export default class BrowserManager {
  app: App;

  browsers: Map<AppBrowsersIdentifiers, Browser> = new Map();

  constructor(app: App) {
    this.app = app;
  }

  getMainWindow() {
    return this.retrieveByIdentifier('chat');
  }

  showMainWindow() {
    const window = this.getMainWindow();

    window.show();
  }

  showSettingsWindow() {
    const window = this.retrieveByIdentifier('settings');

    window.show();

    return window;
  }

  broadcastToAllWindows = <T extends MainBroadcastEventKey>(
    event: T,
    data: MainBroadcastParams<T>,
  ) => {
    this.browsers.forEach((browser) => {
      browser.broadcast(event, data);
    });
  };

  broadcastToWindow = <T extends MainBroadcastEventKey>(
    identifier: AppBrowsersIdentifiers,
    event: T,
    data: MainBroadcastParams<T>,
  ) => {
    this.browsers.get(identifier).broadcast(event, data);
  };

  /**
   * Display the settings window and navigate to a specific tab
   * @param tab Settings window sub-path tab
   */
  async showSettingsWindowWithTab(tab?: string) {
    // common is the main path for settings route
    if (tab && tab !== 'common') {
      const browser = await this.redirectToPage('settings', tab);

      // make provider page more large
      if (tab.startsWith('provider/')) {
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

      console.log(`[BrowserManager] Redirecting to: ${fullPath}`);

      // Load URL and show window
      await browser.loadUrl(fullPath);
      browser.show();

      return browser;
    } catch (error) {
      console.error(`[BrowserManager] Failed to redirect (${identifier}/${subPath}):`, error);
      throw error;
    }
  }

  /**
   * get Browser by identifier
   */
  retrieveByIdentifier(identifier: AppBrowsersIdentifiers) {
    const browser = this.browsers.get(identifier);

    if (browser) return browser;

    return this.retrieveOrInitialize(appBrowsers[identifier]);
  }

  /**
   * init all browser when app start up
   */
  initializeBrowsers() {
    Object.values(appBrowsers).forEach((browser) => {
      console.log('[BrowserManager] initialize browser:', browser.identifier);
      this.retrieveOrInitialize(browser);
    });
  }

  // helper

  /**
   * Retrieve or initialize
   * @param options
   */
  private retrieveOrInitialize(options: BrowserWindowOpts) {
    let browser = this.browsers.get(options.identifier as AppBrowsersIdentifiers);
    if (browser) {
      return browser;
    }

    browser = new Browser(options, this.app);

    this.browsers.set(options.identifier as AppBrowsersIdentifiers, browser);

    return browser;
  }
}
