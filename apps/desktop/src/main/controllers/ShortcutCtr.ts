import { ControllerModule, ipcClientEvent } from '.';

export default class ShortcutController extends ControllerModule {
  /**
   * 获取所有快捷键配置
   */
  @ipcClientEvent('getShortcutsConfig')
  getShortcutsConfig() {
    return this.app.shortcutManager.getShortcutsConfig();
  }

  /**
   * 更新单个快捷键配置
   */
  @ipcClientEvent('updateShortcutConfig')
  updateShortcutConfig(id: string, accelerator: string): boolean {
    return this.app.shortcutManager.updateShortcutConfig(id, accelerator);
  }
}
