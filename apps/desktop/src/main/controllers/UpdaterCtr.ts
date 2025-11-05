import { createLogger } from '@/utils/logger';

import { ControllerModule, ipcClientEvent } from './index';

const logger = createLogger('controllers:UpdaterCtr');

export default class UpdaterCtr extends ControllerModule {
  /**
   * Check for updates
   */
  @ipcClientEvent('checkUpdate')
  async checkForUpdates() {
    logger.info('Check for updates requested');
    await this.app.updaterManager.checkForUpdates();
  }

  /**
   * Download update
   */
  @ipcClientEvent('downloadUpdate')
  async downloadUpdate() {
    logger.info('Download update requested');
    await this.app.updaterManager.downloadUpdate();
  }

  /**
   * Quit application and install update
   */
  @ipcClientEvent('installNow')
  quitAndInstallUpdate() {
    logger.info('Quit and install update requested');
    this.app.updaterManager.installNow();
  }

  /**
   * Install update on next startup
   */
  @ipcClientEvent('installLater')
  installLater() {
    logger.info('Install later requested');
    this.app.updaterManager.installLater();
  }
}
