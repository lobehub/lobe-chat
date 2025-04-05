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

    return window;
  }

  /**
   * 显示设置窗口并导航到特定tab
   * @param tab 设置窗口的子路径tab
   */
  async showSettingsWindowWithTab(tab?: string) {
    // common 是 settings 路由的主路径
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
   * 将窗口导航到特定子路径
   * @param identifier 窗口标识符
   * @param subPath 子路径，如 'agent', 'about' 等
   */
  async redirectToPage(identifier: AppBrowsersIdentifiers, subPath?: string) {
    try {
      // 确保获取或创建窗口
      const browser = this.retrieveByIdentifier(identifier);
      browser.hide();

      const baseRoute = appBrowsers[identifier].path;

      // 构建完整的URL路径
      const fullPath = subPath ? `${baseRoute}/${subPath}` : baseRoute;

      console.log(`[BrowserManager] 重定向到: ${fullPath}`);

      // 加载URL并显示窗口
      await browser.loadUrl(fullPath);
      browser.show();

      return browser;
    } catch (error) {
      console.error(`[BrowserManager] redirectToTab 失败 (${identifier}/${subPath}):`, error);
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
