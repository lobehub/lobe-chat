import { BrowserWindow, app } from 'electron';

import { isLinux } from '@/const/env';
import { createLogger } from '@/utils/logger';

import type { App } from '../App';

const logger = createLogger('core:WindowLifecycleManager');

export class WindowLifecycleManager {
  private window: BrowserWindow;
  private identifier: string;
  private app: App;
  private lastRendererProcessCrashTime: number = 0;

  constructor(window: BrowserWindow, identifier: string, app: App) {
    this.window = window;
    this.identifier = identifier;
    this.app = app;
    this.setupLifecycleEvents();
  }

  /**
   * Setup advanced window lifecycle events
   */
  private setupLifecycleEvents(): void {
    this.setupZoomFactorHandling();
    this.setupFullscreenHandling();
    this.setupRenderProcessMonitoring();
    this.setupWindowStateEvents();
  }

  /**
   * Setup zoom factor handling to prevent zoom reset issues
   */
  private setupZoomFactorHandling(): void {
    this.window.once('ready-to-show', () => {
      const zoomFactor = this.app.storeManager.get('zoomFactor', 1);
      logger.debug(`[${this.identifier}] Setting initial zoom factor: ${zoomFactor}`);
      this.window.webContents.setZoomFactor(zoomFactor);
    });

    // Handle zoom reset on window resize (known Electron bug workaround)
    // See: https://github.com/electron/electron/issues/10572
    this.window.on('will-resize', () => {
      const zoomFactor = this.app.storeManager.get('zoomFactor', 1);
      logger.debug(`[${this.identifier}] Reapplying zoom factor on resize: ${zoomFactor}`);
      this.window.webContents.setZoomFactor(zoomFactor);
    });

    // Handle zoom reset on window restore
    this.window.on('restore', () => {
      const zoomFactor = this.app.storeManager.get('zoomFactor', 1);
      logger.debug(`[${this.identifier}] Reapplying zoom factor on restore: ${zoomFactor}`);
      this.window.webContents.setZoomFactor(zoomFactor);
    });

    // For Linux: resize event instead of will-resize (may cause flicker but necessary)
    if (isLinux) {
      this.window.on('resize', () => {
        const zoomFactor = this.app.storeManager.get('zoomFactor', 1);
        logger.debug(`[${this.identifier}] Reapplying zoom factor on Linux resize: ${zoomFactor}`);
        this.window.webContents.setZoomFactor(zoomFactor);
      });
    }
  }

  /**
   * Setup fullscreen event handling
   */
  private setupFullscreenHandling(): void {
    // Broadcast fullscreen status changes
    this.window.on('enter-full-screen', () => {
      logger.debug(`[${this.identifier}] Entered fullscreen mode`);
      this.window.webContents.send('fullscreen-status-changed', true);
    });

    this.window.on('leave-full-screen', () => {
      logger.debug(`[${this.identifier}] Left fullscreen mode`);
      this.window.webContents.send('fullscreen-status-changed', false);
    });

    // Add Escape key support for exiting fullscreen
    this.window.webContents.on('before-input-event', (event, input) => {
      if (
        input.key === 'Escape' &&
        !input.alt &&
        !input.control &&
        !input.meta &&
        !input.shift &&
        this.window.isFullScreen()
      ) {
        logger.debug(`[${this.identifier}] Escape key pressed in fullscreen, exiting`);
        event.preventDefault();
        this.window.setFullScreen(false);
      }
    });
  }

  /**
   * Setup render process monitoring and crash recovery
   */
  private setupRenderProcessMonitoring(): void {
    this.window.webContents.on('render-process-gone', (_, details) => {
      logger.error(
        `[${this.identifier}] Renderer process crashed with: ${JSON.stringify(details)}`,
      );

      const currentTime = Date.now();
      const lastCrashTime = this.lastRendererProcessCrashTime;
      this.lastRendererProcessCrashTime = currentTime;

      // If more than 1 minute since last crash, try to recover
      if (currentTime - lastCrashTime > 60 * 1000) {
        logger.info(`[${this.identifier}] Attempting to recover from renderer crash`);
        this.window.webContents.reload();
      } else {
        // If crashes are frequent (less than 1 minute apart), exit application
        logger.error(
          `[${this.identifier}] Frequent renderer crashes detected, exiting application`,
        );
        app.exit(1);
      }
    });
  }

  /**
   * Setup window state change events
   */
  private setupWindowStateEvents(): void {
    this.window.on('maximize', () => {
      logger.debug(`[${this.identifier}] Window maximized`);
      this.window.webContents.send('window-state-changed', { maximized: true });
    });

    this.window.on('unmaximize', () => {
      logger.debug(`[${this.identifier}] Window unmaximized`);
      this.window.webContents.send('window-state-changed', { maximized: false });
    });

    this.window.on('minimize', () => {
      logger.debug(`[${this.identifier}] Window minimized`);
      this.window.webContents.send('window-state-changed', { minimized: true });
    });

    this.window.on('restore', () => {
      logger.debug(`[${this.identifier}] Window restored`);
      this.window.webContents.send('window-state-changed', { minimized: false });
    });
  }

  /**
   * Update zoom factor for this window
   */
  setZoomFactor(factor: number): void {
    if (this.window && !this.window.isDestroyed()) {
      logger.debug(`[${this.identifier}] Setting zoom factor to: ${factor}`);
      this.window.webContents.setZoomFactor(factor);
      this.app.storeManager.set('zoomFactor', factor);
    }
  }

  /**
   * Get current zoom factor
   */
  getZoomFactor(): number {
    if (this.window && !this.window.isDestroyed()) {
      return this.window.webContents.getZoomFactor();
    }
    return this.app.storeManager.get('zoomFactor', 1);
  }

  /**
   * Clean up event listeners
   */
  cleanup(): void {
    // Event listeners are automatically cleaned up when the window is destroyed
    logger.debug(`[${this.identifier}] WindowLifecycleManager cleanup completed`);
  }
}
