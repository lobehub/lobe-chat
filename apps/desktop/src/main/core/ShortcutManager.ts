import { globalShortcut } from 'electron';

import { DEFAULT_SHORTCUTS_CONFIG } from '@/shortcuts';

import type { App } from './App';

export class ShortcutManager {
  private app: App;
  private shortcuts: Map<string, () => void> = new Map();
  private shortcutsConfig: Record<string, string> = {};

  constructor(app: App) {
    this.app = app;

    app.shortcutMethodMap.forEach((method, key) => {
      this.shortcuts.set(key, method);
    });
  }

  initialize() {
    // 从存储中加载快捷键配置
    this.loadShortcutsConfig();
    // 注册配置的快捷键
    this.registerConfiguredShortcuts();
  }

  /**
   * 获取快捷键配置
   */
  getShortcutsConfig(): Record<string, string> {
    return this.shortcutsConfig;
  }

  /**
   * 更新单个快捷键配置
   */
  updateShortcutConfig(id: string, accelerator: string): boolean {
    try {
      // 更新配置
      this.shortcutsConfig[id] = accelerator;

      this.saveShortcutsConfig();
      this.registerConfiguredShortcuts();
      return true;
    } catch (error) {
      console.error(`[ShortcutManager] Error updating shortcut ${id}:`, error);
      return false;
    }
  }

  /**
   * 注册全局快捷键
   * @param accelerator 快捷键
   * @param callback 回调函数
   * @returns 是否注册成功
   */
  registerShortcut(accelerator: string, callback: () => void): boolean {
    try {
      // 如果已经注册过，先注销
      if (this.shortcuts.has(accelerator)) {
        this.unregisterShortcut(accelerator);
      }

      // 注册新的快捷键
      const success = globalShortcut.register(accelerator, callback);

      if (success) {
        this.shortcuts.set(accelerator, callback);
        console.log(`[ShortcutManager] Registered shortcut: ${accelerator}`);
      } else {
        console.error(`[ShortcutManager] Failed to register shortcut: ${accelerator}`);
      }

      return success;
    } catch (error) {
      console.error(`[ShortcutManager] Error registering shortcut: ${accelerator}`, error);
      return false;
    }
  }

  /**
   * 注销全局快捷键
   * @param accelerator 快捷键
   */
  unregisterShortcut(accelerator: string): void {
    try {
      globalShortcut.unregister(accelerator);
      this.shortcuts.delete(accelerator);
      console.log(`[ShortcutManager] Unregistered shortcut: ${accelerator}`);
    } catch (error) {
      console.error(`[ShortcutManager] Error unregistering shortcut: ${accelerator}`, error);
    }
  }

  /**
   * 检查快捷键是否已注册
   * @param accelerator 快捷键
   * @returns 是否已注册
   */
  isRegistered(accelerator: string): boolean {
    return globalShortcut.isRegistered(accelerator);
  }

  /**
   * 注销所有快捷键
   */
  unregisterAll(): void {
    globalShortcut.unregisterAll();
    console.log('[ShortcutManager] Unregistered all shortcuts');
  }

  /**
   * 从存储中加载快捷键配置
   */
  private loadShortcutsConfig() {
    try {
      // 尝试从存储中获取配置
      const config = this.app.storeManager.get('shortcuts');

      // 如果没有配置，使用默认配置
      if (!config || Object.keys(config).length === 0) {
        this.shortcutsConfig = DEFAULT_SHORTCUTS_CONFIG;
        this.saveShortcutsConfig();
      } else {
        this.shortcutsConfig = config;
      }

      console.log('[ShortcutManager] Loaded shortcuts config:', this.shortcutsConfig);
    } catch (error) {
      console.error('[ShortcutManager] Error loading shortcuts config:', error);
      this.shortcutsConfig = DEFAULT_SHORTCUTS_CONFIG;
      this.saveShortcutsConfig();
    }
  }

  /**
   * 保存快捷键配置到存储
   */
  private saveShortcutsConfig() {
    try {
      this.app.storeManager.set('shortcuts', this.shortcutsConfig);
      console.log('[ShortcutManager] Saved shortcuts config');
    } catch (error) {
      console.error('[ShortcutManager] Error saving shortcuts config:', error);
    }
  }

  /**
   * 注册配置的快捷键
   */
  private registerConfiguredShortcuts() {
    // 先注销所有快捷键
    this.unregisterAll();

    // 注册每个启用的快捷键
    Object.entries(this.shortcutsConfig).forEach(([id, accelerator]) => {
      console.log(`[ShortcutManager] registering '${id}' with ${accelerator}...`);

      const method = this.shortcuts.get(id);
      if (accelerator && method) {
        this.registerShortcut(accelerator, method);
      }
    });
  }
}
