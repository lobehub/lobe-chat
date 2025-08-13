import { ControllerModule, ipcClientEvent } from './index';

export default class MenuController extends ControllerModule {
  /**
   * 刷新菜单
   */
  @ipcClientEvent('refreshAppMenu')
  refreshAppMenu() {
    // 注意：可能需要根据具体情况决定是否允许渲染进程刷新所有菜单
    return this.app.menuManager.refreshMenus();
  }

  /**
   * 显示上下文菜单
   */
  @ipcClientEvent('showContextMenu')
  showContextMenu(params: { data?: any; type: string }) {
    return this.app.menuManager.showContextMenu(params.type, params.data);
  }

  /**
   * 设置开发菜单可见性
   */
  @ipcClientEvent('setDevMenuVisibility')
  setDevMenuVisibility(visible: boolean) {
    // 调用 MenuManager 的方法来重建应用菜单
    return this.app.menuManager.rebuildAppMenu({ showDevItems: visible });
  }
}
