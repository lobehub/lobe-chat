import { ElectronAppState, ThemeMode } from '@lobechat/electron-client-ipc';
import { app, nativeTheme, shell, systemPreferences } from 'electron';
import { macOS } from 'electron-is';
import process from 'node:process';

import { createLogger } from '@/utils/logger';

import { ControllerModule, IpcMethod } from './index';

const logger = createLogger('controllers:SystemCtr');

export default class SystemController extends ControllerModule {
  static override readonly groupName = 'system';
  private systemThemeListenerInitialized = false;

  /**
   * Initialize system theme listener when app is ready
   */
  afterAppReady() {
    this.initializeSystemThemeListener();
  }

  /**
   * Handles the 'getDesktopAppState' IPC request.
   * Gathers essential application and system information.
   */
  @IpcMethod()
  async getAppState(): Promise<ElectronAppState> {
    const platform = process.platform;
    const arch = process.arch;

    return {
      // System Info
      arch,
      isLinux: platform === 'linux',
      isMac: platform === 'darwin',
      isWindows: platform === 'win32',
      platform: platform as 'darwin' | 'win32' | 'linux',
      systemAppearance: nativeTheme.shouldUseDarkColors ? 'dark' : 'light',
      userPath: {
        // User Paths (ensure keys match UserPathData / DesktopAppState interface)
        desktop: app.getPath('desktop'),
        documents: app.getPath('documents'),
        downloads: app.getPath('downloads'),
        home: app.getPath('home'),
        music: app.getPath('music'),
        pictures: app.getPath('pictures'),
        userData: app.getPath('userData'),
        videos: app.getPath('videos'),
      },
    };
  }

  @IpcMethod()
  requestAccessibilityAccess() {
    if (!macOS()) return true;
    return systemPreferences.isTrustedAccessibilityClient(true);
  }

  @IpcMethod()
  getAccessibilityStatus() {
    if (!macOS()) return true;
    return systemPreferences.isTrustedAccessibilityClient(false);
  }

  @IpcMethod()
  async getMediaAccessStatus(mediaType: 'microphone' | 'screen'): Promise<string> {
    if (!macOS()) return 'granted';
    return systemPreferences.getMediaAccessStatus(mediaType);
  }

  @IpcMethod()
  async requestMicrophoneAccess(): Promise<boolean> {
    if (!macOS()) return true;
    return systemPreferences.askForMediaAccess('microphone');
  }

  @IpcMethod()
  async requestScreenAccess(): Promise<void> {
    if (!macOS()) return;
    shell.openExternal(
      'x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture',
    );
  }

  @IpcMethod()
  openFullDiskAccessSettings() {
    if (!macOS()) return;
    shell.openExternal('x-apple.systempreferences:com.apple.preference.security?Privacy_AllFiles');
  }

  @IpcMethod()
  openExternalLink(url: string) {
    return shell.openExternal(url);
  }

  /**
   * 更新应用语言设置
   */
  @IpcMethod()
  async updateLocale(locale: string) {
    // 保存语言设置
    this.app.storeManager.set('locale', locale);

    // 更新i18n实例的语言
    await this.app.i18n.changeLanguage(locale === 'auto' ? app.getLocale() : locale);
    this.app.browserManager.broadcastToAllWindows('localeChanged', { locale });

    return { success: true };
  }

  @IpcMethod()
  async updateThemeModeHandler(themeMode: ThemeMode) {
    this.app.storeManager.set('themeMode', themeMode);
    this.app.browserManager.broadcastToAllWindows('themeChanged', { themeMode });

    // Apply visual effects to all browser windows when theme mode changes
    this.app.browserManager.handleAppThemeChange();
    // Set app theme mode to the system theme mode

    this.setSystemThemeMode(themeMode);
  }

  @IpcMethod()
  async getSystemThemeMode() {
    return nativeTheme.themeSource;
  }

  @IpcMethod()
  async setSystemThemeMode(themeMode: ThemeMode) {
    nativeTheme.themeSource = themeMode === 'auto' ? 'system' : themeMode;
  }

  /**
   * Initialize system theme listener to monitor OS theme changes
   */
  private initializeSystemThemeListener() {
    if (this.systemThemeListenerInitialized) {
      logger.debug('System theme listener already initialized');
      return;
    }

    logger.info('Initializing system theme listener');

    // Get initial system theme
    const initialDarkMode = nativeTheme.shouldUseDarkColors;
    const initialSystemTheme: ThemeMode = initialDarkMode ? 'dark' : 'light';
    logger.info(`Initial system theme: ${initialSystemTheme}`);

    // Listen for system theme changes
    nativeTheme.on('updated', () => {
      const isDarkMode = nativeTheme.shouldUseDarkColors;
      const systemTheme: ThemeMode = isDarkMode ? 'dark' : 'light';

      logger.info(`System theme changed to: ${systemTheme}`);

      // Broadcast system theme change to all renderer processes
      this.app.browserManager.broadcastToAllWindows('systemThemeChanged', {
        themeMode: systemTheme,
      });
    });

    this.systemThemeListenerInitialized = true;
    logger.info('System theme listener initialized successfully');
  }
}
