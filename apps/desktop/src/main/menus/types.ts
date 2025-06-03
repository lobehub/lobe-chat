import { Menu } from 'electron';

export interface MenuOptions {
  showDevItems?: boolean;
  // 其他可能的配置项
}

export interface IMenuPlatform {
  /**
   * 构建并设置应用菜单
   */
  buildAndSetAppMenu(options?: MenuOptions): Menu;

  /**
   * 构建上下文菜单
   */
  buildContextMenu(type: string, data?: any): Menu;

  /**
   * 构建托盘菜单
   */
  buildTrayMenu(): Menu;

  /**
   * 刷新菜单
   */
  refresh(options?: MenuOptions): void;
}
