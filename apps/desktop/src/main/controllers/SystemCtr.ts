import { ElectronAppState } from '@lobechat/electron-client-ipc';
import { app, shell, systemPreferences } from 'electron';
import { macOS } from 'electron-is';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

import { DB_SCHEMA_HASH_FILENAME, LOCAL_DATABASE_DIR, userDataDir } from '@/const/dir';

import { ControllerModule, ipcClientEvent, ipcServerEvent } from './index';

export default class SystemController extends ControllerModule {
  /**
   * Handles the 'getDesktopAppState' IPC request.
   * Gathers essential application and system information.
   */
  @ipcClientEvent('getDesktopAppState')
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

  /**
   * 检查可用性
   */
  @ipcClientEvent('checkSystemAccessibility')
  checkAccessibilityForMacOS() {
    if (!macOS()) return;
    return systemPreferences.isTrustedAccessibilityClient(true);
  }

  @ipcClientEvent('openExternalLink')
  openExternalLink(url: string) {
    return shell.openExternal(url);
  }

  /**
   * 更新应用语言设置
   */
  @ipcClientEvent('updateLocale')
  async updateLocale(locale: string) {
    // 保存语言设置
    this.app.storeManager.set('locale', locale);

    // 更新i18n实例的语言
    await this.app.i18n.changeLanguage(locale === 'auto' ? app.getLocale() : locale);

    return { success: true };
  }

  @ipcServerEvent('getDatabasePath')
  async getDatabasePath() {
    return join(this.app.appStoragePath, LOCAL_DATABASE_DIR);
  }

  @ipcServerEvent('getDatabaseSchemaHash')
  async getDatabaseSchemaHash() {
    try {
      return readFileSync(this.DB_SCHEMA_HASH_PATH, 'utf8');
    } catch {
      return undefined;
    }
  }

  @ipcServerEvent('getUserDataPath')
  async getUserDataPath() {
    return userDataDir;
  }

  @ipcServerEvent('setDatabaseSchemaHash')
  async setDatabaseSchemaHash(hash: string) {
    writeFileSync(this.DB_SCHEMA_HASH_PATH, hash, 'utf8');
  }

  private get DB_SCHEMA_HASH_PATH() {
    return join(this.app.appStoragePath, DB_SCHEMA_HASH_FILENAME);
  }
}
