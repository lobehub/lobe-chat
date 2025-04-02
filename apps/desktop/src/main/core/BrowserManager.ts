import { chat } from '../appBrowsers';
import type { App } from './App';
import type { BrowserWindowOpts } from './Browser';
import Browser from './Browser';

export default class BrowserManager {
  app: App;

  browsers: Map<string, Browser | null> = new Map();

  constructor(app: App) {
    this.app = app;
  }

  /**
   * 启动或初始化
   * @param options
   */
  retrieveOrInitialize(options: BrowserWindowOpts) {
    let browser = this.browsers.get(options.identifier);
    if (browser) {
      return browser;
    }

    browser = new Browser(options, this.app);

    this.browsers.set(options.identifier, browser);

    return browser;
  }

  showMainWindow() {
    const window = this.retrieveOrInitialize(chat);
    window.show();
  }
}
