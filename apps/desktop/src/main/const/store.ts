/**
 * 应用设置存储相关常量
 */
import { appStorageDir } from '@/const/dir';
import { DEFAULT_SHORTCUTS_CONFIG } from '@/shortcuts';
import { ElectronMainStore } from '@/types/store';

/**
 * 存储名称
 */
export const STORE_NAME = 'lobehub-settings';

/**
 * 存储默认值
 */
export const STORE_DEFAULTS: ElectronMainStore = {
  dataSyncConfig: { storageMode: 'local' },
  encryptedTokens: {},
  locale: 'auto',
  shortcuts: DEFAULT_SHORTCUTS_CONFIG,
  storagePath: appStorageDir,
};
