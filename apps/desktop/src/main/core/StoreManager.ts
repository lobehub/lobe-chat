import Store from 'electron-store';

import { STORE_DEFAULTS, STORE_NAME } from '@/const/store';
import { ElectronMainStore, StoreKey } from '@/types/store';

import { App } from './App';

/**
 * 应用配置存储管理类
 */
export class StoreManager {
  /**
   * 全局配置存储实例
   */
  private store: Store<ElectronMainStore>;
  private app: App;

  constructor(app: App) {
    this.app = app;
    this.store = new Store<ElectronMainStore>({
      defaults: STORE_DEFAULTS,
      name: STORE_NAME,
    });
  }

  /**
   * 获取配置项
   * @param key 配置键
   * @param defaultValue 默认值
   */
  get<K extends StoreKey>(key: K, defaultValue?: ElectronMainStore[K]): ElectronMainStore[K] {
    return this.store.get(key, defaultValue as any);
  }

  /**
   * 设置配置项
   * @param key 配置键
   * @param value 配置值
   */
  set<K extends StoreKey>(key: K, value: ElectronMainStore[K]): void {
    this.store.set(key, value);
  }

  /**
   * 删除配置项
   * @param key 配置键
   */
  delete(key: StoreKey): void {
    this.store.delete(key);
  }

  /**
   * 清空存储
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * 检查是否存在某个配置项
   * @param key 配置键
   */
  has(key: StoreKey): boolean {
    return this.store.has(key);
  }

  async openInEditor() {
    await this.store.openInEditor();
  }
}
