import { app, systemPreferences } from 'electron';
import { macOS } from 'electron-is';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { userDataDir } from '@/const/dir';

import { ControllerModule, ipcClientEvent, ipcServerEvent } from './index';

const DB_SCHEMA_HASH_PATH = path.join(userDataDir, 'lobehub-local-db-schema-hash');

export default class SystemService extends ControllerModule {
  /**
   * 检查可用性
   */
  @ipcClientEvent('checkSystemAccessibility')
  checkAccessibilityForMacOS() {
    if (!macOS()) return;
    return systemPreferences.isTrustedAccessibilityClient(true);
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
    return path.join(userDataDir, 'lobehub-local-db');
  }

  @ipcServerEvent('getDatabaseSchemaHash')
  async getDatabaseSchemaHash() {
    try {
      return readFileSync(DB_SCHEMA_HASH_PATH, 'utf8');
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
    writeFileSync(DB_SCHEMA_HASH_PATH, hash, 'utf8');
  }
}
