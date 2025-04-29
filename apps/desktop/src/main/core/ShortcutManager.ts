import { globalShortcut } from 'electron';

import { DEFAULT_SHORTCUTS_CONFIG } from '@/shortcuts';
import { createLogger } from '@/utils/logger';

import type { App } from './App';

// Create logger
const logger = createLogger('core:ShortcutManager');

export class ShortcutManager {
  private app: App;
  private shortcuts: Map<string, () => void> = new Map();
  private shortcutsConfig: Record<string, string> = {};

  constructor(app: App) {
    logger.debug('Initializing ShortcutManager');
    this.app = app;

    app.shortcutMethodMap.forEach((method, key) => {
      this.shortcuts.set(key, method);
    });
  }

  initialize() {
    logger.info('Initializing global shortcuts');
    // Load shortcuts configuration from storage
    this.loadShortcutsConfig();
    // Register configured shortcuts
    this.registerConfiguredShortcuts();
  }

  /**
   * Get shortcuts configuration
   */
  getShortcutsConfig(): Record<string, string> {
    return this.shortcutsConfig;
  }

  /**
   * Update a single shortcut configuration
   */
  updateShortcutConfig(id: string, accelerator: string): boolean {
    try {
      logger.debug(`Updating shortcut ${id} to ${accelerator}`);
      // Update configuration
      this.shortcutsConfig[id] = accelerator;

      this.saveShortcutsConfig();
      this.registerConfiguredShortcuts();
      return true;
    } catch (error) {
      logger.error(`Error updating shortcut ${id}:`, error);
      return false;
    }
  }

  /**
   * Register global shortcut
   * @param accelerator Shortcut key combination
   * @param callback Callback function
   * @returns Whether registration was successful
   */
  registerShortcut(accelerator: string, callback: () => void): boolean {
    try {
      // If already registered, unregister first
      if (this.shortcuts.has(accelerator)) {
        this.unregisterShortcut(accelerator);
      }

      // Register new shortcut
      const success = globalShortcut.register(accelerator, callback);

      if (success) {
        this.shortcuts.set(accelerator, callback);
        logger.debug(`Registered shortcut: ${accelerator}`);
      } else {
        logger.error(`Failed to register shortcut: ${accelerator}`);
      }

      return success;
    } catch (error) {
      logger.error(`Error registering shortcut: ${accelerator}`, error);
      return false;
    }
  }

  /**
   * Unregister global shortcut
   * @param accelerator Shortcut key combination
   */
  unregisterShortcut(accelerator: string): void {
    try {
      globalShortcut.unregister(accelerator);
      this.shortcuts.delete(accelerator);
      logger.debug(`Unregistered shortcut: ${accelerator}`);
    } catch (error) {
      logger.error(`Error unregistering shortcut: ${accelerator}`, error);
    }
  }

  /**
   * Check if a shortcut is already registered
   * @param accelerator Shortcut key combination
   * @returns Whether it is registered
   */
  isRegistered(accelerator: string): boolean {
    return globalShortcut.isRegistered(accelerator);
  }

  /**
   * Unregister all shortcuts
   */
  unregisterAll(): void {
    globalShortcut.unregisterAll();
    logger.info('Unregistered all shortcuts');
  }

  /**
   * Load shortcuts configuration from storage
   */
  private loadShortcutsConfig() {
    try {
      // Try to get configuration from storage
      const config = this.app.storeManager.get('shortcuts');

      // If no configuration, use default configuration
      if (!config || Object.keys(config).length === 0) {
        logger.debug('No shortcuts config found, using defaults');
        this.shortcutsConfig = DEFAULT_SHORTCUTS_CONFIG;
        this.saveShortcutsConfig();
      } else {
        this.shortcutsConfig = config;
      }

      logger.debug('Loaded shortcuts config:', this.shortcutsConfig);
    } catch (error) {
      logger.error('Error loading shortcuts config:', error);
      this.shortcutsConfig = DEFAULT_SHORTCUTS_CONFIG;
      this.saveShortcutsConfig();
    }
  }

  /**
   * Save shortcuts configuration to storage
   */
  private saveShortcutsConfig() {
    try {
      this.app.storeManager.set('shortcuts', this.shortcutsConfig);
      logger.debug('Saved shortcuts config');
    } catch (error) {
      logger.error('Error saving shortcuts config:', error);
    }
  }

  /**
   * Register configured shortcuts
   */
  private registerConfiguredShortcuts() {
    // Unregister all shortcuts first
    this.unregisterAll();

    // Register each enabled shortcut
    Object.entries(this.shortcutsConfig).forEach(([id, accelerator]) => {
      logger.debug(`Registering shortcut '${id}' with ${accelerator}`);

      const method = this.shortcuts.get(id);
      if (accelerator && method) {
        this.registerShortcut(accelerator, method);
      }
    });
  }
}
