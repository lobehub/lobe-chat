import type { App } from '@/core/App';

import { ipcClientEvent } from './index';

export default class UpdaterService {
  private app: App;

  constructor(app: App) {
    this.app = app;
  }

  /**
   * 检查更新
   */
  @ipcClientEvent('checkUpdate')
  async checkForUpdates() {
    console.log('[UpdaterSrv] Check for updates requested');
    await this.app.updaterManager.checkForUpdates();
  }

  /**
   * 下载更新
   */
  @ipcClientEvent('downloadUpdate')
  async downloadUpdate() {
    console.log('[UpdaterSrv] Download update requested');
    await this.app.updaterManager.downloadUpdate();
  }

  /**
   * 关闭应用并安装更新
   */
  @ipcClientEvent('installNow')
  quitAndInstallUpdate() {
    console.log('[UpdaterSrv] Quit and install update requested');
    this.app.updaterManager.installNow();
  }

  /**
   * 下次启动时安装更新
   */
  @ipcClientEvent('installLater')
  installLater() {
    console.log('[UpdaterSrv] Install later requested');
    this.app.updaterManager.installLater();
  }
}
