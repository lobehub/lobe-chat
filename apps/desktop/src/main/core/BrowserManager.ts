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
   * 显示设置窗口并导航到特定tab
   * @param tab 设置窗口的子路径tab
   */
  showSettingsWindowWithTab(tab?: string) {
    if (tab) {
      this.redirectToTab('settings', tab);
    } else {
      this.showSettingsWindow();
    }
  }

  /**
   * 将窗口导航到特定子路径
   * @param identifier 窗口标识符
   * @param subPath 子路径，如 'agent', 'about' 等
   */
  redirectToTab(identifier: AppBrowsersIdentifiers, subPath?: string) {
    try {
      // 确保获取或创建窗口
      const browser = this.retrieveByIdentifier(identifier);
      const baseRoute = appBrowsers[identifier].path;

      // 构建完整的URL路径
      const fullPath = subPath ? `${baseRoute}/${subPath}` : baseRoute;

      console.log(`[BrowserManager] 重定向到: ${fullPath}`);

      // 加载URL并显示窗口
      const window = browser.browserWindow;

      // 确保窗口初始化完成
      if (window.isDestroyed()) {
        console.log(`[BrowserManager] 窗口已销毁，重新创建: ${identifier}`);
        // 窗口已销毁，重新创建
        const newBrowser = this.retrieveOrInitialize(appBrowsers[identifier]);
        newBrowser.loadUrl(fullPath).then(() => {
          newBrowser.show();
        });
      } else {
        // 正常加载URL
        window.webContents.loadURL(`${this.app.nextServerUrl}${fullPath}`);
        browser.show();
      }

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
