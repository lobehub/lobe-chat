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

    // 使用系统语言或默认语言
    const defaultLanguage = lang || app.getLocale() || 'en-US';

    // console.log(`[I18n] 初始化 i18n, 语言: ${defaultLanguage}`);

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

    // 预加载基础命名空间
    // console.log(`[I18n] 开始加载基础命名空间`);
    await Promise.all(
      ['menu', 'dialog', 'common'].map((ns) => this.loadNamespace(this.i18n.language, ns)),
    );

    // 检查资源是否正确加载
    // console.log(
    //   `[I18n] 检查资源状态:`,
    //   this.i18n.hasResourceBundle(this.i18n.language, 'menu'),
    //   this.i18n.getResourceBundle(this.i18n.language, 'menu'),
    // );

    console.log('i18n initialized, app locale:', this.i18n.language);
    this.initialized = true;

    this.refreshMainUI();

    // 监听语言变化事件
    this.i18n.on('languageChanged', this.handleLanguageChanged);

    return this.i18n;
  }

  /**
   * 加载指定命名空间的翻译资源
   */
  async loadNamespace(lng: string, ns: string) {
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

  /**
   * 基础翻译函数
   */
  t = (key: string, options?: any) => {
    const result = this.i18n.t(key, options) as string;

    // 如果翻译结果与键相同，可能表示未找到翻译
    if (result === key) {
      console.warn(`[I18n] 未找到翻译: ${key}`);
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
   * 切换语言
   */
  async changeLanguage(lang: string) {
    // 先加载基础命名空间，再切换语言
    await Promise.all(['menu', 'dialog', 'common'].map((ns) => this.loadNamespace(lang, ns)));

    return this.i18n.changeLanguage(lang);
  }

  /**
   * 获取当前语言
   */
  getCurrentLanguage() {
    return this.i18n.language;
  }

  /**
   * 处理语言变化事件
   */
  private handleLanguageChanged = async (lng: string) => {
    // 通知主进程其他部分刷新 UI
    this.refreshMainUI();

    // 通知渲染进程语言已变化
    this.notifyRendererProcess(lng);
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
    console.log(lng);
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
}
