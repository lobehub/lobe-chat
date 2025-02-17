import { systemPreferences } from 'electron';
import { macOS } from 'electron-is';

import { ControllerModule, ipcClientEvent } from './index';

export default class SystemService extends ControllerModule {
  /**
   * 检查可用性
   */
  @ipcClientEvent('checkSystemAccessibility')
  checkAccessibilityForMacOS() {
    if (!macOS()) return;
    return systemPreferences.isTrustedAccessibilityClient(true);
  }
}
