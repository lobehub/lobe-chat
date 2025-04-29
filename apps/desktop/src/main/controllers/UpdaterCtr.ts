import { createLogger } from '@/utils/logger';

import { ControllerModule, ipcClientEvent } from './index';

const logger = createLogger('controllers:UpdaterCtr');

export default class UpdaterCtr extends ControllerModule {
  /**
   * 检查更新
   */
  @ipcClientEvent('checkUpdate')
  async checkForUpdates() {
    logger.info('Check for updates requested');
    await this.app.updaterManager.checkForUpdates();
  }

  /**
   * 下载更新
   */
  @ipcClientEvent('downloadUpdate')
  async downloadUpdate() {
    logger.info('Download update requested');
    await this.app.updaterManager.downloadUpdate();
  }

  /**
   * 关闭应用并安装更新
   */
  @ipcClientEvent('installNow')
  quitAndInstallUpdate() {
    logger.info('Quit and install update requested');
    this.app.updaterManager.installNow();
  }

  /**
   * 下次启动时安装更新
   */
  @ipcClientEvent('installLater')
  installLater() {
    logger.info('Install later requested');
    this.app.updaterManager.installLater();
  }
}
