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

  showMainWindow() {
    const window = this.retrieveByIdentifier('chat');

    window.show();
  }

  showSettingsWindow() {
    const window = this.retrieveByIdentifier('settings');

    window.show();
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
      console.log('initialize browser:', browser.identifier);
      this.retrieveOrInitialize(browser);
    });
  }

  // helper

  /**
   * 启动或初始化
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
