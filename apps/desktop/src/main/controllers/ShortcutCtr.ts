import { ShortcutUpdateResult } from '@/core/ui/ShortcutManager';

import { ControllerModule, ipcClientEvent } from '.';

export default class ShortcutController extends ControllerModule {
  /**
   * Get all shortcut configurations
   */
  @ipcClientEvent('getShortcutsConfig')
  getShortcutsConfig() {
    return this.app.shortcutManager.getShortcutsConfig();
  }

  /**
   * Update a single shortcut configuration
   */
  @ipcClientEvent('updateShortcutConfig')
  updateShortcutConfig({
    id,
    accelerator,
  }: {
    accelerator: string;
    id: string;
  }): ShortcutUpdateResult {
    return this.app.shortcutManager.updateShortcutConfig(id, accelerator);
  }
}
