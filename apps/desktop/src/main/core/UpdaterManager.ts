import log from 'electron-log';
import { autoUpdater } from 'electron-updater';

import { isDev } from '@/const/env';
import { UPDATE_CHANNEL as channel, updaterConfig } from '@/modules/updater/configs';

import type { App as AppCore } from './App';

export class UpdaterManager {
  private app: AppCore;
  private checking: boolean = false;
  private downloading: boolean = false;
  private updateAvailable: boolean = false;
  private isManualCheck: boolean = false;

  constructor(app: AppCore) {
    this.app = app;

    // 设置日志
    log.transports.file.level = 'info';
    autoUpdater.logger = log;

    log.info(`[Updater] Log file should be at: ${log.transports.file.getFile().path}`); // 打印路径
  }

  get mainWindow() {
    return this.app.browserManager.getMainWindow();
  }

  public initialize = async () => {
    // 如果是禁用了更新且为生产环境，不初始化更新
    if (!updaterConfig.enableAppUpdate && !isDev) return;

    // 配置 autoUpdater
    autoUpdater.autoDownload = false; // 设置为false，我们将手动控制下载
    autoUpdater.autoInstallOnAppQuit = false;

    autoUpdater.channel = channel;
    autoUpdater.allowPrerelease = channel !== 'stable';

    // 开发环境时启用测试模式
    if (isDev) {
      log.info(
        `[Updater] Running in dev mode, forcing update check, channel: ${autoUpdater.channel}`,
      );
      // 开发环境下允许测试更新
      autoUpdater.forceDevUpdateConfig = true;
    }

    // 注册事件
    this.registerEvents();

    // 如果配置了自动检查更新，则设置定时检查
    if (updaterConfig.app.autoCheckUpdate) {
      // 启动后延迟 1 分钟检查更新，避免启动时网络可能不稳定
      setTimeout(() => this.checkForUpdates(false), 3 * 1000);

      // 设置定期检查
      setInterval(() => this.checkForUpdates(false), updaterConfig.app.checkUpdateInterval);
    }

    // 在 initialize 的开头也打印一下 channel 和 allowPrerelease 的最终值
    log.debug(
      `[Updater] Initializing with channel: ${autoUpdater.channel}, allowPrerelease: ${autoUpdater.allowPrerelease}`,
    );
  };

  /**
   * 检查更新
   * @param manual 是否为手动检查更新
   */
  public checkForUpdates = async (manual: boolean = true) => {
    if (this.checking || this.downloading) return;

    this.checking = true;
    this.isManualCheck = manual;
    log.info(`[Updater] ${manual ? 'Manually checking' : 'Auto checking'} for update...`);

    // 如果是手动检查，通知渲染进程开始检查更新
    if (manual) {
      this.mainWindow.broadcast('updateCheckStart');
    }

    try {
      await autoUpdater.checkForUpdates();
    } catch (error) {
      log.error('[Updater] Error checking for updates:', error.message);

      // 如果是手动检查，通知渲染进程检查更新出错
      if (manual) {
        this.mainWindow.broadcast('updateError', (error as Error).message);
      }
    } finally {
      this.checking = false;
    }
  };

  /**
   * 下载更新
   * @param manual 是否为手动下载更新
   */
  public downloadUpdate = async (manual: boolean = false) => {
    if (this.downloading || !this.updateAvailable) return;

    this.downloading = true;
    log.info(`[Updater] ${manual ? 'Manually downloading' : 'Auto downloading'} update...`);

    // 如果是手动下载，通知渲染进程开始下载更新
    if (manual || this.isManualCheck) {
      this.mainWindow.broadcast('updateDownloadStart');
    }

    try {
      await autoUpdater.downloadUpdate();
    } catch (error) {
      this.downloading = false;
      log.error('[Updater] Error downloading update:', error);

      // 如果是手动下载或手动检查，通知渲染进程下载更新出错
      if (manual || this.isManualCheck) {
        this.mainWindow.broadcast('updateError', (error as Error).message);
      }
    }
  };

  /**
   * 立即安装更新
   */
  public installNow = () => {
    log.info('[Updater] Installing update now...');

    // 关闭主窗口
    this.mainWindow.close();

    // 延迟 1 秒后安装更新，确保窗口已关闭
    setTimeout(() => {
      autoUpdater.quitAndInstall(false, true);
    }, 1000);
  };

  /**
   * 下次启动时安装更新
   */
  public installLater = () => {
    log.info('[Updater] Update will be installed on next restart');

    // 标记下次启动时安装，但不退出应用
    autoUpdater.autoInstallOnAppQuit = true;

    // 通知渲染进程更新将在下次启动时安装
    this.mainWindow.broadcast('updateWillInstallLater');
  };

  /**
   * 测试模式：模拟有可用更新
   * 仅在开发环境中使用
   */
  public simulateUpdateAvailable = () => {
    if (!isDev) return;

    log.info('[Updater] Simulating update available...');

    const mainWindow = this.mainWindow;
    // 模拟一个新版本更新
    const mockUpdateInfo = {
      releaseDate: new Date().toISOString(),
      releaseNotes: ` #### 版本 1.0.0 更新内容
- 新增了一些非常棒的功能
- 修复了一些影响使用的 bug
- 优化了应用的整体性能
- 更新了依赖库版本
`,
      version: '1.0.0',
    };

    // 设置更新可用状态
    this.updateAvailable = true;

    // 通知渲染进程
    if (this.isManualCheck) {
      mainWindow.broadcast('updateAvailable', mockUpdateInfo);
    } else {
      // 自动检查模式下，直接模拟下载
      this.simulateDownloadProgress();
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
        releaseNotes: ` #### 版本 1.0.0 更新内容
- 新增了一些非常棒的功能
- 修复了一些影响使用的 bug
- 优化了应用的整体性能
- 更新了依赖库版本
`,
        version: '1.0.0',
      };

      // 设置下载状态
      this.downloading = false;

      // 通知渲染进程
      mainWindow.broadcast('updateDownloaded', mockUpdateInfo);
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

    // 如果是手动检查更新，才广播下载开始事件
    if (this.isManualCheck) {
      mainWindow.broadcast('updateDownloadStart');
    }

    // 模拟进度更新
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;

      if (
        progress <= 100 && // 只有在手动检查更新时，才广播下载进度
        this.isManualCheck
      ) {
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
    }, 300);
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

      const mainWindow = this.mainWindow;

      // 只有在手动检查更新时，才通知渲染进程有更新可用
      if (mainWindow && this.isManualCheck) {
        mainWindow.broadcast('updateAvailable', info);
      }

      // 自动开始下载更新，无论是自动检查还是手动检查
      // 对于自动检查，将在后台静默下载
      this.downloadUpdate(this.isManualCheck);
    });

    // 没有更新事件
    autoUpdater.on('update-not-available', (info) => {
      log.info('[Updater] Update not available:', info);
      this.updateAvailable = false;

      // 只有在手动检查更新时，才通知渲染进程没有更新
      if (this.isManualCheck) {
        this.mainWindow.broadcast('updateNotAvailable', info);
      }
    });

    // 更新下载进度事件
    autoUpdater.on('download-progress', (progressObj) => {
      // 只有在手动检查更新时，才广播下载进度
      if (this.isManualCheck) {
        this.mainWindow.broadcast('updateDownloadProgress', progressObj);
      }
    });

    // 更新下载完成事件
    autoUpdater.on('update-downloaded', (info) => {
      log.info('[Updater] Update downloaded:', info);
      this.downloading = false;

      // 下载完成后，总是通知渲染进程，无论是自动检查还是手动检查
      this.mainWindow.broadcast('updateDownloaded', info);
    });

    // 更新错误事件
    autoUpdater.on('error', (error, message) => {
      log.error('[Updater] Error in auto-updater:', error);
      this.checking = false;
      this.downloading = false;

      // 只有在手动检查更新时，才通知渲染进程出错
      if (this.isManualCheck) {
        const mainWindow = this.app.browserManager.getMainWindow();
        if (mainWindow) {
          mainWindow.broadcast('updateError', message || (error as Error).message);
        }
      }
    });
  }
}
