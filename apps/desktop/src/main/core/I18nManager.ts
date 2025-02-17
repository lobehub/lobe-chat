import { app } from 'electron';
import i18next from 'i18next';

import { App } from '@/core/App';
import { loadResources } from '@/locales/resources';

export class I18nManager {
  private i18n: typeof i18next;
  private initialized: boolean = false;
  private app: App;

  constructor(app: App) {
    this.app = app;
    this.i18n = i18next.createInstance();
  }

  /**
   * 初始化 i18next 实例
   */
  async init(lang?: string) {
    if (this.initialized) return this.i18n;

    // 优先从参数获取语言，其次从存储中获取，最后使用系统语言
    const storedLocale = this.app.storeManager.get('locale', 'auto') as string;
    const defaultLanguage =
      lang || (storedLocale !== 'auto' ? storedLocale : app.getLocale()) || 'en-US';

    console.log(
      `[i18nManager] initializing i18n, app locale: ${defaultLanguage}, stored locale: ${storedLocale}`,
    );

    await this.i18n.init({
      defaultNS: 'menu',
      fallbackLng: 'en-US',
      // 按需加载资源
      initAsync: true,
      interpolation: {
        escapeValue: false,
      },

      lng: defaultLanguage,

      ns: ['menu', 'dialog', 'common'],
      partialBundledLanguages: true,
    });

    console.log(`[i18nManager] i18n initialized, language: ${this.i18n.language}`);

    // 预加载基础命名空间
    await this.loadLocale(this.i18n.language);

    this.initialized = true;

    this.refreshMainUI();

    // 监听语言变化事件
    this.i18n.on('languageChanged', this.handleLanguageChanged);

    return this.i18n;
  }

  /**
   * 基础翻译函数
   */
  t = (key: string, options?: any) => {
    const result = this.i18n.t(key, options) as string;

    // 如果翻译结果与键相同，可能表示未找到翻译
    if (result === key) {
      console.warn(`[I18nManager] ${this.i18n.language} key: ${key} is not found`);
    }

    return result;
  };

  /**
   * 创建绑定指定命名空间的翻译函数
   * @param namespace 命名空间
   * @returns 绑定了命名空间的翻译函数
   */
  createNamespacedT(namespace: string) {
    return (key: string, options: any = {}) => {
      // 复制选项以避免修改原始对象
      const mergedOptions = { ...options };
      // 设置命名空间
      mergedOptions.ns = namespace;

      return this.t(key, mergedOptions);
    };
  }

  /**
   * 根据命名空间获取翻译函数
   * 提供更方便的调用方式
   */
  ns = (namespace: string) => this.createNamespacedT(namespace);

  /**
   * 获取当前语言
   */
  getCurrentLanguage() {
    return this.i18n.language;
  }

  /**
   * 切换应用语言
   * @param lng 目标语言
   */
  public async changeLanguage(lng: string): Promise<void> {
    if (!this.initialized) {
      await this.init();
    }

    await this.i18n.changeLanguage(lng);
    // 语言变化事件会触发handleLanguageChanged
  }

  /**
   * 处理语言变化事件
   */
  private handleLanguageChanged = async (lang: string) => {
    await this.loadLocale(lang);

    // 通知主进程其他部分刷新 UI
    this.refreshMainUI();
  };

  /**
   * 刷新主进程 UI (菜单等)
   */
  private refreshMainUI() {
    this.app.menuManager.refreshMenus();
  }

  /**
   * 通知渲染进程语言已变化
   */
  private notifyRendererProcess(lng: string) {
    console.log('[I18nManager] notifyRendererProcess', lng);

    // 向所有窗口发送语言变化事件
    // const windows = this.app.browserManager.windows;
    //
    // if (windows && windows.length > 0) {
    //   windows.forEach((window) => {
    //     if (window?.webContents) {
    //       window.webContents.send('language-changed', lng);
    //     }
    //   });
    // }
  }

  private async loadLocale(language: string) {
    // 预加载基础命名空间
    await Promise.all(['menu', 'dialog', 'common'].map((ns) => this.loadNamespace(language, ns)));
  }

  /**
   * 加载指定命名空间的翻译资源
   */
  private async loadNamespace(lng: string, ns: string) {
    try {
      const resources = await loadResources(lng, ns);
      // console.log(`[I18n] 加载翻译资源: ${lng}/${ns}`, resources);
      this.i18n.addResourceBundle(lng, ns, resources, true, true);
      return true;
    } catch (error) {
      console.error(`加载命名空间失败: ${lng}/${ns}`, error);
      return false;
    }
  }
}
