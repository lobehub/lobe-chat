import { PublishProvider } from 'builder-util-runtime/out/publishOptions';
import { dialog } from 'electron';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';

import { isDev } from '@/const/env';
import {
  GITHUB_OWNER,
  GITHUB_REPO,
  UPDATE_CHANNEL as channel,
  updaterConfig,
} from '@/modules/updater/configs';

import type { App as AppCore } from './App';

export class UpdaterManager {
  private app: AppCore;
  private checking: boolean = false;
  private downloading: boolean = false;
  private updateAvailable: boolean = false;

  constructor(app: AppCore) {
    this.app = app;

    // 设置日志
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
  }

  public initialize = async () => {
    // 如果是开发环境或禁用了更新，不初始化更新
    if (!updaterConfig.enableAppUpdate && !isDev) return;

    // 配置 autoUpdater
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.allowPrerelease = channel !== 'stable';

    // 开发环境时启用测试模式
    if (isDev) {
      log.info('[Updater] Running in dev mode, forcing update check');
      // 开发环境下允许测试更新
      autoUpdater.forceDevUpdateConfig = true;
    }

    // 设置更新源
    const feedUrl = {
      owner: GITHUB_OWNER,
      provider: 'github' as PublishProvider,
      repo: GITHUB_REPO,
    };
    autoUpdater.setFeedURL(feedUrl);

    // 注册事件
    this.registerEvents();

    // 如果配置了自动检查更新，则设置定时检查
    if (updaterConfig.app.autoCheckUpdate) {
      // 启动后延迟 1 分钟检查更新，避免启动时网络可能不稳定
      setTimeout(() => this.checkForUpdates(), 60 * 1000);

      // 设置定期检查
      setInterval(() => this.checkForUpdates(), updaterConfig.app.checkUpdateInterval);
    }
  };

  /**
   * 检查更新
   */
  public checkForUpdates = async () => {
    if (this.checking || this.downloading) return;

    this.checking = true;
    log.info('[Updater] Checking for update...');

    try {
      await autoUpdater.checkForUpdates();
    } catch (error) {
      log.error('[Updater] Error checking for updates:', error);
    } finally {
      this.checking = false;
    }
  };

  /**
   * 下载更新
   */
  public downloadUpdate = async () => {
    if (this.downloading || !this.updateAvailable) return;

    this.downloading = true;
    log.info('[Updater] Downloading update...');

    try {
      await autoUpdater.downloadUpdate();
    } catch (error) {
      this.downloading = false;
      log.error('[Updater] Error downloading update:', error);
    }
  };

  /**
   * 安装更新
   */
  public quitAndInstall = () => {
    log.info('[Updater] Quitting and installing update...');

    // 关闭主窗口
    const mainWindow = this.app.browserManager.getMainWindow();
    if (mainWindow) {
      mainWindow.close();
    }

    // 延迟 1 秒后安装更新，确保窗口已关闭
    setTimeout(() => {
      autoUpdater.quitAndInstall(false, true);
    }, 1000);
  };

  /**
   * 测试模式：模拟有可用更新
   * 仅在开发环境中使用
   */
  public simulateUpdateAvailable = () => {
    if (!isDev) return;

    log.info('[Updater] Simulating update available...');

    const mainWindow = this.app.browserManager.getMainWindow();
    if (mainWindow) {
      // 模拟一个新版本更新
      const mockUpdateInfo = {
        releaseDate: new Date().toISOString(),
        releaseNotes: '这是一个模拟的更新版本，用于测试更新功能。',
        version: '1.0.0',
      };

      // 设置更新可用状态
      this.updateAvailable = true;

      // 通知渲染进程
      mainWindow.broadcast('updateAvailable', mockUpdateInfo);
    }
  };

  /**
   * 测试模式：模拟更新已下载
   * 仅在开发环境中使用
   */
  public simulateUpdateDownloaded = () => {
    if (!isDev) return;

    log.info('[Updater] Simulating update downloaded...');

    const mainWindow = this.app.browserManager.getMainWindow();
    if (mainWindow) {
      // 模拟一个新版本更新
      const mockUpdateInfo = {
        releaseDate: new Date().toISOString(),
        releaseNotes: '这是一个模拟的更新版本，用于测试更新功能。',
        version: '1.0.0',
      };

      // 设置下载状态
      this.downloading = false;

      // 通知渲染进程
      mainWindow.broadcast('updateDownloaded', mockUpdateInfo);

      // 显示更新提示对话框
      dialog
        .showMessageBox(mainWindow.browserWindow, {
          buttons: ['立即安装', '稍后安装'],
          defaultId: 0,
          detail: '模拟更新已下载，是否立即安装并重启应用？',
          message: `Lobe Chat 1.0.0 (模拟版本) 已准备好安装`,
          title: '更新已下载 (测试模式)',
          type: 'info',
        })
        .then(({ response }) => {
          if (
            response === 0 && // 在测试模式下，不实际执行安装，只是关闭主窗口然后重新打开
            mainWindow
          ) {
            mainWindow.close();
            setTimeout(() => {
              this.app.browserManager.showMainWindow();
            }, 1000);
          }
        });
    }
  };

  /**
   * 测试模式：模拟更新下载进度
   * 仅在开发环境中使用
   */
  public simulateDownloadProgress = () => {
    if (!isDev) return;

    log.info('[Updater] Simulating download progress...');

    const mainWindow = this.app.browserManager.getMainWindow();

    // 设置下载状态
    this.downloading = true;

    // 模拟进度更新
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;

      if (progress <= 100) {
        mainWindow.broadcast('updateDownloadProgress', {
          bytesPerSecond: 1024 * 1024,
          percent: progress, // 1MB/s
          total: 1024 * 1024 * 100, // 100MB
          transferred: 1024 * 1024 * progress,
        });
      }

      if (progress >= 100) {
        clearInterval(interval);
        this.simulateUpdateDownloaded();
      }
    }, 500);
  };

  private registerEvents() {
    // 检查更新事件
    autoUpdater.on('checking-for-update', () => {
      log.info('[Updater] Checking for update...');
    });

    // 发现新版本事件
    autoUpdater.on('update-available', async (info) => {
      log.info('[Updater] Update available:', info);
      this.updateAvailable = true;

      // 通知渲染进程有更新可用
      const mainWindow = this.app.browserManager.getMainWindow();
      if (mainWindow) {
        mainWindow.broadcast('updateAvailable', info);
      }

      // 如果配置了自动下载，则下载更新
      if (updaterConfig.app.autoDownloadUpdate) {
        this.downloadUpdate();
      }
    });

    // 没有更新事件
    autoUpdater.on('update-not-available', (info) => {
      log.info('[Updater] Update not available:', info);
      this.updateAvailable = false;
    });

    // 更新下载进度事件
    autoUpdater.on('download-progress', (progressObj) => {
      const mainWindow = this.app.browserManager.getMainWindow();
      if (mainWindow) {
        mainWindow.broadcast('updateDownloadProgress', progressObj);
      }
    });

    // 更新下载完成事件
    autoUpdater.on('update-downloaded', (info) => {
      log.info('[Updater] Update downloaded:', info);
      this.downloading = false;

      const mainWindow = this.app.browserManager.getMainWindow();
      if (mainWindow) {
        mainWindow.broadcast('updateDownloaded', info);

        // 显示更新提示对话框
        dialog
          .showMessageBox(mainWindow.browserWindow, {
            buttons: ['立即安装', '稍后安装'],
            defaultId: 0,
            detail: '更新已下载，是否立即安装并重启应用？',
            message: `Lobe Chat ${info.version} 已准备好安装`,
            title: '更新已下载',
            type: 'info',
          })
          .then(({ response }) => {
            if (response === 0) {
              this.quitAndInstall();
            }
          });
      }
    });

    // 更新错误事件
    autoUpdater.on('error', (error, message) => {
      log.error('[Updater] Error in auto-updater:', error);
      this.checking = false;
      this.downloading = false;

      const mainWindow = this.app.browserManager.getMainWindow();
      if (mainWindow) {
        mainWindow.broadcast('updateError', message || (error as Error).message);
      }
    });
  }
}
