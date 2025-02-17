/**
 * 应用设置存储相关常量
 */
import { ElectronMainStore } from '@/types/store';

/**
 * 存储名称
 */
export const STORE_NAME = 'lobehub-settings';

/**
 * 存储默认值
 */
export const STORE_DEFAULTS: ElectronMainStore = {
  locale: 'auto',
};
