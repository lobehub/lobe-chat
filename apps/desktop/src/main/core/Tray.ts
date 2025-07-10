import { MainBroadcastEventKey, MainBroadcastParams } from '@lobechat/electron-client-ipc';
import {
  DisplayBalloonOptions,
  Tray as ElectronTray,
  Menu,
  MenuItemConstructorOptions,
  app,
  nativeImage,
} from 'electron';
import { join } from 'node:path';

import { resourcesDir } from '@/const/dir';
import { createLogger } from '@/utils/logger';

import type { App } from './App';

// 创建日志记录器
const logger = createLogger('core:Tray');

export interface TrayOptions {
  /**
   * 托盘图标路径（相对于资源目录）
   */
  iconPath: string;

  /**
   * 托盘标识符
   */
  identifier: string;

  /**
   * 托盘提示文本
   */
  tooltip?: string;
}

export default class Tray {
  private app: App;

  /**
   * 内部 Electron 托盘
   */
  private _tray?: ElectronTray;

  /**
   * 标识符
   */
  identifier: string;

  /**
   * 创建时的选项
   */
  options: TrayOptions;

  /**
   * 获取托盘实例
   */
  get tray() {
    return this.retrieveOrInitialize();
  }

  /**
   * 构造托盘对象
   * @param options 托盘选项
   * @param application 应用实例
   */
  constructor(options: TrayOptions, application: App) {
    logger.debug(`创建托盘实例: ${options.identifier}`);
    logger.debug(`托盘选项: ${JSON.stringify(options)}`);
    this.app = application;
    this.identifier = options.identifier;
    this.options = options;

    // 初始化
    this.retrieveOrInitialize();
  }

  /**
   * 初始化托盘
   */
  retrieveOrInitialize() {
    // 如果托盘已存在且未被销毁，则返回
    if (this._tray) {
      logger.debug(`[${this.identifier}] 返回现有托盘实例`);
      return this._tray;
    }

    const { iconPath, tooltip } = this.options;

    // 加载托盘图标
    logger.info(`创建新的托盘实例: ${this.identifier}`);
    const iconFile = join(resourcesDir, iconPath);
    logger.debug(`[${this.identifier}] 加载图标: ${iconFile}`);

    try {
      const icon = nativeImage.createFromPath(iconFile);
      this._tray = new ElectronTray(icon);

      // 设置工具提示
      if (tooltip) {
        logger.debug(`[${this.identifier}] 设置提示文本: ${tooltip}`);
        this._tray.setToolTip(tooltip);
      }

      // 设置默认上下文菜单
      this.setContextMenu();

      // 设置点击事件
      this._tray.on('click', () => {
        logger.debug(`[${this.identifier}] 托盘被点击`);
        this.onClick();
      });

      logger.debug(`[${this.identifier}] 托盘实例创建完成`);
      return this._tray;
    } catch (error) {
      logger.error(`[${this.identifier}] 创建托盘失败:`, error);
      throw error;
    }
  }

  /**
   * 设置托盘上下文菜单
   * @param template 菜单模板，如果未提供则使用默认模板
   */
  setContextMenu(template?: MenuItemConstructorOptions[]) {
    logger.debug(`[${this.identifier}] 设置托盘上下文菜单`);

    // 如果未提供模板，使用默认菜单
    const defaultTemplate: MenuItemConstructorOptions[] = template || [
      {
        click: () => {
          logger.debug(`[${this.identifier}] 菜单项 "显示主窗口" 被点击`);
          this.app.browserManager.showMainWindow();
        },
        label: '显示主窗口',
      },
      { type: 'separator' },
      {
        click: () => {
          logger.debug(`[${this.identifier}] 菜单项 "退出" 被点击`);
          app.quit();
        },
        label: '退出',
      },
    ];

    const contextMenu = Menu.buildFromTemplate(defaultTemplate);
    this._tray?.setContextMenu(contextMenu);
    logger.debug(`[${this.identifier}] 托盘上下文菜单已设置`);
  }

  /**
   * 处理托盘点击事件
   */
  onClick() {
    logger.debug(`[${this.identifier}] 处理托盘点击事件`);
    const mainWindow = this.app.browserManager.getMainWindow();

    if (mainWindow) {
      if (mainWindow.browserWindow.isVisible() && mainWindow.browserWindow.isFocused()) {
        logger.debug(`[${this.identifier}] 主窗口已可见且聚焦，现在隐藏它`);
        mainWindow.hide();
      } else {
        logger.debug(`[${this.identifier}] 显示并聚焦主窗口`);
        mainWindow.show();
        mainWindow.browserWindow.focus();
      }
    }
  }

  /**
   * 更新托盘图标
   * @param iconPath 新图标路径（相对于资源目录）
   */
  updateIcon(iconPath: string) {
    logger.debug(`[${this.identifier}] 更新图标: ${iconPath}`);
    try {
      const iconFile = join(resourcesDir, iconPath);
      const icon = nativeImage.createFromPath(iconFile);
      this._tray?.setImage(icon);
      this.options.iconPath = iconPath;
      logger.debug(`[${this.identifier}] 图标已更新`);
    } catch (error) {
      logger.error(`[${this.identifier}] 更新图标失败:`, error);
    }
  }

  /**
   * 更新提示文本
   * @param tooltip 新提示文本
   */
  updateTooltip(tooltip: string) {
    logger.debug(`[${this.identifier}] 更新提示文本: ${tooltip}`);
    this._tray?.setToolTip(tooltip);
    this.options.tooltip = tooltip;
  }

  /**
   * 显示气泡通知（仅在 Windows 上支持）
   * @param options 气泡选项
   */
  displayBalloon(options: DisplayBalloonOptions) {
    if (process.platform === 'win32' && this._tray) {
      logger.debug(`[${this.identifier}] 显示气泡通知: ${JSON.stringify(options)}`);
      this._tray.displayBalloon(options);
    } else {
      logger.debug(`[${this.identifier}] 气泡通知仅在 Windows 上支持`);
    }
  }

  /**
   * 广播事件
   */
  broadcast = <T extends MainBroadcastEventKey>(channel: T, data?: MainBroadcastParams<T>) => {
    logger.debug(`向托盘 ${this.identifier} 广播, 频道: ${channel}`);
    // 可以通过 App 实例的 browserManager 将消息转发到主窗口
    this.app.browserManager.getMainWindow()?.broadcast(channel, data);
  };

  /**
   * 销毁托盘实例
   */
  destroy() {
    logger.debug(`销毁托盘实例: ${this.identifier}`);
    if (this._tray) {
      this._tray.destroy();
      this._tray = undefined;
    }
  }
}
