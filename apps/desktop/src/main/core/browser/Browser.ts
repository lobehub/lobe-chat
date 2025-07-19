import { MainBroadcastEventKey, MainBroadcastParams } from '@lobechat/electron-client-ipc';
import { BrowserWindow, BrowserWindowConstructorOptions, app } from 'electron';
import windowStateKeeper from 'electron-window-state';
import { join } from 'node:path';

import { resourcesDir } from '@/const/dir';
import { isMac } from '@/const/env';
import { createLogger } from '@/utils/logger';

import type { App } from '../App';
import {
  WindowConfigBuilder,
  WindowDisplayManager,
  WindowErrorHandler,
  WindowLifecycleManager,
  WindowPositionManager,
  WindowSpellCheckManager,
  WindowThemeManager,
  WindowWebRequestManager,
} from '../window';

// Create logger
const logger = createLogger('core:Browser');

export interface BrowserWindowOpts extends BrowserWindowConstructorOptions {
  devTools?: boolean;
  height?: number;
  identifier: string;
  keepAlive?: boolean;
  parentIdentifier?: string;
  path: string;
  showOnInit?: boolean;
  title?: string;
  width?: number;
}

export class Browser {
  private app: App;

  /**
   * Internal electron window
   */
  private _browserWindow?: BrowserWindow;

  private stopInterceptHandler?: () => void;

  // Helper managers
  private errorHandler?: WindowErrorHandler;
  private themeManager?: WindowThemeManager;
  private positionManager?: WindowPositionManager;
  private lifecycleManager?: WindowLifecycleManager;
  private webRequestManager?: WindowWebRequestManager;
  private spellCheckManager?: WindowSpellCheckManager;
  private displayManager?: WindowDisplayManager;

  /**
   * Identifier
   */
  readonly identifier: string;

  /**
   * Options at creation
   */
  readonly options: BrowserWindowOpts;

  /**
   * Window state keeper instance for managing window position and size
   */
  private windowStateKeeper?: windowStateKeeper.State;

  /**
   * Track if event listeners have been set up to avoid duplicates
   */
  private eventListenersSetup = false;

  /**
   * Method to expose window externally
   */
  get browserWindow() {
    return this.retrieveOrInitialize();
  }

  get webContents() {
    if (this._browserWindow?.isDestroyed()) return null;

    return this._browserWindow.webContents;
  }

  /**
   * Method to construct BrowserWindows object
   * @param options
   * @param application
   */
  constructor(options: BrowserWindowOpts, application: App) {
    logger.debug(`Creating Browser instance: ${options.identifier}`);
    logger.debug(`Browser options: ${JSON.stringify(options)}`);
    this.app = application;
    this.identifier = options.identifier;
    this.options = options;

    // Initialization
    this.retrieveOrInitialize();
  }

  loadUrl = async (path: string) => {
    const initUrl = this.app.nextServerUrl + path;

    try {
      logger.debug(`[${this.identifier}] Attempting to load URL: ${initUrl}`);
      await this._browserWindow.loadURL(initUrl);
      logger.debug(`[${this.identifier}] Successfully loaded URL: ${initUrl}`);
    } catch (error) {
      logger.error(`[${this.identifier}] Failed to load URL (${initUrl}):`, error);
      await this.handleLoadError(initUrl);
    }
  };

  private async handleLoadError(initUrl: string) {
    await this.errorHandler?.handleLoadError(initUrl);
  }

  loadPlaceholder = async () => {
    logger.debug(`[${this.identifier}] Loading splash screen placeholder`);
    // First load a local HTML loading page
    await this._browserWindow.loadFile(join(resourcesDir, 'splash.html'));
    logger.debug(`[${this.identifier}] Splash screen placeholder loaded.`);
  };

  show() {
    logger.debug(`Showing window: ${this.identifier}`);
    if (!this._browserWindow?.isDestroyed()) {
      this.positionManager?.determinePosition(this.options.parentIdentifier);
      // Handle macOS dock behavior
      if (isMac && app.dock) {
        app.dock.show();
      }
    }

    // Use advanced display manager for better show behavior
    if (this.displayManager) {
      this.displayManager.showWindow();
    } else {
      this.browserWindow.show();
    }
  }

  hide() {
    logger.debug(`Hiding window: ${this.identifier}`);
    // Use advanced display manager for better hide behavior
    if (this.displayManager) {
      this.displayManager.hideWindow();
    } else {
      this.browserWindow.hide();
    }
  }

  close() {
    logger.debug(`Attempting to close window: ${this.identifier}`);
    this.browserWindow.close();
  }

  /**
   * Destroy instance
   */
  destroy() {
    logger.debug(`Destroying window instance: ${this.identifier}`);
    this.cleanupResources();
    this._browserWindow = undefined;
  }

  private cleanupResources() {
    // Clean up intercept handler
    this.stopInterceptHandler?.();

    // Clean up all managers
    this.errorHandler?.cleanupRetryHandler();
    this.themeManager?.cleanup();
    this.lifecycleManager?.cleanup();
    this.webRequestManager?.cleanup();
    this.spellCheckManager?.cleanup();
    this.displayManager?.cleanup();

    // Reset event listeners flag
    this.eventListenersSetup = false;
  }

  /**
   * Initialize
   */
  retrieveOrInitialize() {
    // When there is this window and it has not been destroyed
    if (this._browserWindow && !this._browserWindow.isDestroyed()) {
      logger.debug(`[${this.identifier}] Returning existing BrowserWindow instance.`);
      return this._browserWindow;
    }

    logger.info(`Creating new BrowserWindow instance: ${this.identifier}`);
    logger.debug(`[${this.identifier}] Options for new window: ${JSON.stringify(this.options)}`);

    // Build window configuration using WindowConfigBuilder
    const configBuilder = new WindowConfigBuilder(this.options);
    const config = configBuilder.build();
    this.windowStateKeeper = config.windowStateKeeper;

    logger.debug(
      `[${this.identifier}] Window state restored: ${JSON.stringify({
        height: this.windowStateKeeper.height,
        isFullScreen: this.windowStateKeeper.isFullScreen,
        isMaximized: this.windowStateKeeper.isMaximized,
        width: this.windowStateKeeper.width,
        x: this.windowStateKeeper.x,
        y: this.windowStateKeeper.y,
      })}`,
    );

    const browserWindow = new BrowserWindow(config);

    this._browserWindow = browserWindow;
    logger.debug(`[${this.identifier}] BrowserWindow instance created.`);

    // Initialize all managers
    this.initializeAllManagers(browserWindow);

    // Let window state keeper manage the window
    this.windowStateKeeper.manage(browserWindow);

    // Restore maximized state if needed
    if (this.windowStateKeeper.isMaximized) {
      // Delay maximize to ensure proper display
      browserWindow.once('ready-to-show', () => {
        if (!browserWindow.isDestroyed()) {
          browserWindow.maximize();
        }
      });
    }

    logger.debug(`[${this.identifier}] Setting up nextInterceptor.`);
    this.stopInterceptHandler = this.app.nextInterceptor({
      session: browserWindow.webContents.session,
    });

    logger.debug(`[${this.identifier}] Initiating placeholder and URL loading sequence.`);
    this.loadPlaceholder().then(() => {
      this.loadUrl(this.options.path).catch((e) => {
        logger.error(
          `[${this.identifier}] Initial loadUrl error for path '${this.options.path}':`,
          e,
        );
      });
    });

    // Show devtools if enabled
    if (this.options.devTools) {
      logger.debug(`[${this.identifier}] Opening DevTools because devTools option is true.`);
      browserWindow.webContents.openDevTools();
    }

    this.setupEventListeners(browserWindow, this.options.showOnInit);

    logger.debug(`[${this.identifier}] retrieveOrInitialize completed.`);

    return browserWindow;
  }

  private initializeAllManagers(browserWindow: BrowserWindow): void {
    this.errorHandler = new WindowErrorHandler(browserWindow, this.identifier);
    this.themeManager = new WindowThemeManager(browserWindow, this.identifier);
    this.positionManager = new WindowPositionManager(browserWindow, this.identifier, this.app);
    this.lifecycleManager = new WindowLifecycleManager(browserWindow, this.identifier, this.app);
    this.webRequestManager = new WindowWebRequestManager(browserWindow, this.identifier);
    this.spellCheckManager = new WindowSpellCheckManager(browserWindow, this.identifier, this.app);
    this.displayManager = new WindowDisplayManager(browserWindow, this.identifier, this.app);
  }

  private setupEventListeners(browserWindow: BrowserWindow, showOnInit?: boolean) {
    if (this.eventListenersSetup) return;
    this.eventListenersSetup = true;

    logger.debug(`[${this.identifier}] Setting up event listeners.`);

    browserWindow.once('ready-to-show', () => {
      logger.debug(`[${this.identifier}] Window 'ready-to-show' event fired.`);
      if (showOnInit) {
        logger.debug(`Showing window ${this.identifier} because showOnInit is true.`);
        this.show();
      } else {
        logger.debug(
          `Window ${this.identifier} not shown on 'ready-to-show' because showOnInit is false.`,
        );
      }
    });

    browserWindow.on('close', (e) => {
      logger.debug(`Window 'close' event triggered for: ${this.identifier}`);
      logger.debug(
        `[${this.identifier}] State during close event: isQuiting=${this.app.isQuiting}, keepAlive=${this.options.keepAlive}`,
      );

      // If in application quitting process, allow window to be closed
      if (this.app.isQuiting) {
        logger.debug(`[${this.identifier}] App is quitting, allowing window to close naturally.`);
        // Window state keeper will automatically save state
        this.cleanupResources();
        return;
      }

      // Prevent window from being destroyed, just hide it (if marked as keepAlive)
      if (this.options.keepAlive) {
        logger.debug(
          `[${this.identifier}] keepAlive is true, preventing default close and hiding window.`,
        );
        e.preventDefault();
        browserWindow.hide();

        // Handle macOS dock behavior using display manager
        if (this.displayManager?.shouldHideDock()) {
          app.dock?.hide();
        }
      } else {
        // Window is actually closing (not keepAlive)
        logger.debug(`[${this.identifier}] keepAlive is false, allowing window to close.`);
        // Window state keeper will automatically save state
        this.cleanupResources();
      }
    });

    // Theme changes are now handled by WindowThemeManager
    // Lifecycle events are now handled by WindowLifecycleManager
    // Web requests are now handled by WindowWebRequestManager
    // Spell check is now handled by WindowSpellCheckManager
    // Display management is now handled by WindowDisplayManager
  }

  private shouldHideDock(): boolean {
    // Delegate to display manager for better logic
    return this.displayManager?.shouldHideDock() || false;
  }

  moveToCenter() {
    this.positionManager?.centerWindow();
  }

  /**
   * Center window on current display
   */
  centerOnDisplay() {
    this.displayManager?.centerOnDisplay();
  }

  /**
   * Bring window to front
   */
  bringToFront() {
    this.displayManager?.bringToFront();
  }

  setWindowSize(boundSize: { height?: number; width?: number }) {
    this.positionManager?.setSize(boundSize);
  }

  broadcast = <T extends MainBroadcastEventKey>(channel: T, data?: MainBroadcastParams<T>) => {
    if (this._browserWindow?.isDestroyed()) return;

    logger.debug(`Broadcasting to window ${this.identifier}, channel: ${channel}`);
    this._browserWindow.webContents.send(channel, data);
  };

  applyVisualEffects() {
    this.themeManager?.applyVisualEffects();
  }

  /**
   * Manually reapply visual effects (useful for fixing lost effects after window state changes)
   */
  reapplyVisualEffects() {
    this.themeManager?.reapplyVisualEffects();
  }

  /**
   * Set zoom factor for this window
   */
  setZoomFactor(factor: number) {
    this.lifecycleManager?.setZoomFactor(factor);
  }

  /**
   * Get current zoom factor
   */
  getZoomFactor(): number {
    return this.lifecycleManager?.getZoomFactor() || 1;
  }

  /**
   * Update spell check configuration
   */
  updateSpellCheck(enabled: boolean, languages?: string[], updateAutoSync: boolean = true) {
    this.spellCheckManager?.updateSpellCheck(enabled, languages, updateAutoSync);
  }

  /**
   * Set auto-sync spell check language with i18n
   */
  setAutoSyncSpellCheckLanguage(autoSync: boolean) {
    this.spellCheckManager?.setAutoSyncSpellCheckLanguage(autoSync);
  }

  /**
   * Get current spell check configuration
   */
  getSpellCheckConfig(): {
    autoSync: boolean;
    availableLanguages: readonly string[];
    enabled: boolean;
    languages: string[];
  } {
    return (
      this.spellCheckManager?.getSpellCheckConfig() || {
        autoSync: true,
        availableLanguages: [],
        enabled: false,
        languages: ['en-US'],
      }
    );
  }

  toggleVisible() {
    logger.debug(`Toggling visibility for window: ${this.identifier}`);
    // Use advanced display manager for better toggle behavior
    if (this.displayManager) {
      this.displayManager.toggleWindow();
    } else {
      this.fallbackToggleVisible();
    }
  }

  /**
   * Fallback toggle method if display manager is not available
   */
  private fallbackToggleVisible() {
    if (this._browserWindow?.isVisible() && this._browserWindow.isFocused()) {
      this._browserWindow.hide();
    } else {
      this._browserWindow?.show();
      this._browserWindow?.focus();
    }
  }

  /**
   * Handle window activation
   */
  handleActivation() {
    this.displayManager?.handleActivation();
  }
}
