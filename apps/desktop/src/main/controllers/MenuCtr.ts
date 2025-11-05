import { ControllerModule, ipcClientEvent } from './index';

export default class MenuController extends ControllerModule {
  /**
   * Refresh menu
   */
  @ipcClientEvent('refreshAppMenu')
  refreshAppMenu() {
    // Note: May need to decide whether to allow renderer process to refresh all menus based on specific circumstances
    return this.app.menuManager.refreshMenus();
  }

  /**
   * Show context menu
   */
  @ipcClientEvent('showContextMenu')
  showContextMenu(params: { data?: any; type: string }) {
    return this.app.menuManager.showContextMenu(params.type, params.data);
  }

  /**
   * Set development menu visibility
   */
  @ipcClientEvent('setDevMenuVisibility')
  setDevMenuVisibility(visible: boolean) {
    // Call MenuManager method to rebuild application menu
    return this.app.menuManager.rebuildAppMenu({ showDevItems: visible });
  }
}
