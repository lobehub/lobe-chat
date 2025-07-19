import { BrowserWindow, app, screen } from 'electron';

import { isLinux, isMac } from '@/const/env';
import { createLogger } from '@/utils/logger';

import type { App } from '../App';

const logger = createLogger('core:WindowDisplayManager');

export class WindowDisplayManager {
  private window: BrowserWindow;
  private identifier: string;
  private app: App;
  private wasMainWindowFocused: boolean = false;

  constructor(window: BrowserWindow, identifier: string, app: App) {
    this.window = window;
    this.identifier = identifier;
    this.app = app;
  }

  /**
   * Show window with intelligent display management
   */
  showWindow(): void {
    if (!this.window || this.window.isDestroyed()) {
      logger.warn(`[${this.identifier}] Cannot show destroyed window`);
      return;
    }

    // Store focus state if this is related to main window interaction
    const mainWindow = this.app.browserManager?.getMainWindow();
    this.wasMainWindowFocused = mainWindow?.browserWindow?.isFocused() || false;

    if (this.window.isMinimized()) {
      logger.debug(`[${this.identifier}] Restoring minimized window`);
      this.window.restore();
      return;
    }

    // Handle different platforms for setVisibleOnAllWorkspaces
    if (!isLinux) {
      // On macOS and Windows, use setVisibleOnAllWorkspaces for better UX
      this.window.setVisibleOnAllWorkspaces(true);
    }

    // Handle fullscreen state issues on macOS
    if (isMac && this.window.isFullScreen() && !this.window.isVisible()) {
      logger.debug(`[${this.identifier}] Exiting fullscreen before showing window on macOS`);
      this.window.setFullScreen(false);
    }

    this.window.show();
    this.window.focus();

    // Reset setVisibleOnAllWorkspaces after showing
    if (!isLinux) {
      this.window.setVisibleOnAllWorkspaces(false);
    }

    logger.debug(`[${this.identifier}] Window shown and focused`);
  }

  /**
   * Hide window with platform-specific handling
   */
  hideWindow(): void {
    if (!this.window || this.window.isDestroyed()) {
      logger.warn(`[${this.identifier}] Cannot hide destroyed window`);
      return;
    }

    if (isMac) {
      // On macOS, just hide and potentially hide app if needed
      this.window.hide();
      if (!this.wasMainWindowFocused) {
        app.hide();
      }
    } else if (process.platform === 'win32') {
      // On Windows, minimize first then hide for better UX
      this.window.minimize();
      this.window.hide();
    } else {
      // On Linux and other platforms
      this.window.hide();
    }

    logger.debug(`[${this.identifier}] Window hidden`);
  }

  /**
   * Toggle window visibility with intelligent state management
   */
  toggleWindow(): void {
    if (!this.window || this.window.isDestroyed()) {
      logger.warn(`[${this.identifier}] Cannot toggle destroyed window`);
      return;
    }

    // Don't toggle if window is in fullscreen and visible (except when hidden)
    if (this.window.isFullScreen() && this.window.isVisible()) {
      logger.debug(`[${this.identifier}] Window is in fullscreen, not toggling`);
      return;
    }

    if (this.window.isVisible()) {
      if (this.window.isFocused()) {
        // Window is visible and focused, hide it
        this.hideWindow();
      } else {
        // Window is visible but not focused, focus it
        this.window.focus();
      }
    } else {
      // Window is hidden, show it
      this.showWindow();
    }
  }

  /**
   * Center window on current display
   */
  centerOnDisplay(): void {
    if (!this.window || this.window.isDestroyed()) {
      logger.warn(`[${this.identifier}] Cannot center destroyed window`);
      return;
    }

    const currentDisplay = screen.getDisplayMatching(this.window.getBounds());
    const { workArea } = currentDisplay;
    const windowBounds = this.window.getBounds();

    const x = Math.round(workArea.x + (workArea.width - windowBounds.width) / 2);
    const y = Math.round(workArea.y + (workArea.height - windowBounds.height) / 2);

    logger.debug(`[${this.identifier}] Centering window at position: ${x}, ${y}`);
    this.window.setPosition(x, y);
  }

  /**
   * Bring window to front with cross-platform compatibility
   */
  bringToFront(): void {
    if (!this.window || this.window.isDestroyed()) {
      logger.warn(`[${this.identifier}] Cannot bring destroyed window to front`);
      return;
    }

    // Make sure window is visible first
    if (!this.window.isVisible()) {
      this.showWindow();
      return;
    }

    // Platform-specific bring to front logic
    if (isMac) {
      app.focus({ steal: true });
      this.window.moveTop();
    } else {
      this.window.focus();
      this.window.moveTop();
    }

    logger.debug(`[${this.identifier}] Window brought to front`);
  }

  /**
   * Handle window activation (when app becomes active)
   */
  handleActivation(): void {
    if (!this.window || this.window.isDestroyed()) return;

    // If this is the main window, ensure it's visible when app is activated
    if (this.identifier === 'chat') {
      this.showWindow();
    }
  }

  /**
   * Check if this window should hide dock on close (macOS)
   */
  shouldHideDock(): boolean {
    if (!isMac) return false;

    // Check if any other windows are visible
    const allWindows = BrowserWindow.getAllWindows();
    const visibleWindows = allWindows.filter((win) => win.isVisible() && win !== this.window);

    return visibleWindows.length === 0;
  }

  /**
   * Clean up display manager
   */
  cleanup(): void {
    logger.debug(`[${this.identifier}] WindowDisplayManager cleanup completed`);
  }
}
