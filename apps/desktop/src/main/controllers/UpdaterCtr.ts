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
    return { success: true };
  }

  /**
   * 下载更新
   */
  @ipcClientEvent('downloadUpdate')
  async downloadUpdate() {
    console.log('[UpdaterSrv] Download update requested');
    await this.app.updaterManager.downloadUpdate();
    return { success: true };
  }

  /**
   * 安装更新
   */
  @ipcClientEvent('installUpdate')
  quitAndInstall() {
    console.log('[UpdaterSrv] Install update requested');
    this.app.updaterManager.quitAndInstall();
    return { success: true };
  }

  /**
   * 关闭应用并安装更新
   */
  @ipcClientEvent('quitAndInstallUpdate')
  quitAndInstallUpdate() {
    console.log('[UpdaterSrv] Quit and install update requested');
    this.app.updaterManager.quitAndInstall();
    return { success: true };
  }
}
