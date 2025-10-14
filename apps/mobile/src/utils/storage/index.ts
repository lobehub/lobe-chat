import * as SecureStore from 'expo-secure-store';
import { MMKV } from 'react-native-mmkv';

import { isDev } from '../env';

/**
 * ==================== MMKV 存储实例 ====================
 * 根据 Web 端策略，只为配置类数据创建 MMKV 实例
 */

/**
 * 应用配置存储
 * - 用户偏好设置（主题、字体、语言）
 * - OpenAI 配置（API Key、proxy）
 * - Agent 配置
 * - 开发者模式配置
 */
export const appStorage = new MMKV({
  id: 'lobe-chat-app-storage',
});

/**
 * ==================== Zustand 存储适配器 ====================
 */

/**
 * 创建 Zustand 兼容的存储适配器
 * @param mmkvInstance MMKV 实例
 */
export const createMMKVStorage = (mmkvInstance: MMKV) => ({
  /**
   * 获取存储值
   */
  getItem: (name: string): string | null => {
    const value = mmkvInstance.getString(name);
    return value ?? null;
  },

  /**
   * 删除存储值
   */
  removeItem: (name: string): void => {
    mmkvInstance.delete(name);
  },

  /**
   * 设置存储值
   */
  setItem: (name: string, value: string): void => {
    mmkvInstance.set(name, value);
  },
});

/**
 * ==================== SecureStore 抽象 ====================
 * 用于敏感数据存储（Token、API Keys 等）
 * 注意：TokenStorage 已经独立实现，此处仅作为通用抽象
 */

const SECURE_STORE_OPTIONS = {
  keychainService: 'lobe-chat-auth',
  requireAuthentication: false,
} as const;

export const secureStorage = {
  /**
   * 清除所有安全存储的值
   */
  async clear(keys: string[]): Promise<void> {
    try {
      await Promise.all(keys.map((key) => this.removeItem(key)));
    } catch (error) {
      console.error('[SecureStorage] Failed to clear items', error);
      throw error;
    }
  },

  /**
   * 获取安全存储的值
   */
  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key, SECURE_STORE_OPTIONS);
    } catch (error) {
      console.error(`[SecureStorage] Failed to get item: ${key}`, error);
      return null;
    }
  },

  /**
   * 删除安全存储的值
   */
  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key, SECURE_STORE_OPTIONS);
    } catch (error) {
      console.error(`[SecureStorage] Failed to remove item: ${key}`, error);
      throw error;
    }
  },

  /**
   * 设置安全存储的值
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value, SECURE_STORE_OPTIONS);
    } catch (error) {
      console.error(`[SecureStorage] Failed to set item: ${key}`, error);
      throw error;
    }
  },
};

/**
 * ==================== 调试工具 ====================
 */

/**
 * 打印所有存储的键值对（开发调试用）
 */
export const debugStorage = () => {
  if (isDev) {
    console.log('=== App Storage Keys ===');
    console.log(appStorage.getAllKeys());

    console.log('\n=== App Storage Content ===');
    appStorage.getAllKeys().forEach((key) => {
      const value = appStorage.getString(key);
      console.log(`${key}:`, value);
    });
  }
};

/**
 * 清除所有 MMKV 存储（谨慎使用）
 */
export const clearAllStorage = () => {
  appStorage.clearAll();
  console.log('[Storage] All MMKV storage cleared');
};
