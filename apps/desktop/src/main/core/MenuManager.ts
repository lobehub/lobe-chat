import { Menu } from 'electron';

import { IMenuPlatform, MenuOptions, createMenuImpl } from '@/menus';

import type { App } from './App';

export default class MenuManager {
  app: App;
  private platformImpl: IMenuPlatform;

  constructor(app: App) {
    this.app = app;
    this.platformImpl = createMenuImpl(app);
  }

  /**
   * 初始化菜单（主要是应用菜单）
   */
  initialize(options?: MenuOptions) {
    this.platformImpl.buildAndSetAppMenu(options);
  }

  /**
   * 构建并显示上下文菜单
   */
  showContextMenu(type: string, data?: any) {
    const menu = this.platformImpl.buildContextMenu(type, data);
    menu.popup(); // popup 需要在主进程中调用
    return { success: true };
  }

  /**
   * 构建托盘菜单 (通常由托盘管理器调用)
   */
  buildTrayMenu(): Menu {
    return this.platformImpl.buildTrayMenu();
  }

  /**
   * 刷新菜单
   */
  refreshMenus(options?: MenuOptions) {
    this.platformImpl.refresh(options);
    return { success: true };
  }

  /**
   * 重新构建和设置应用菜单（例如切换开发菜单可见性）
   */
  rebuildAppMenu(options?: MenuOptions) {
    this.platformImpl.buildAndSetAppMenu(options);
    return { success: true };
  }
}
