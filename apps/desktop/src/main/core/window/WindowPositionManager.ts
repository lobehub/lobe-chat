import { BrowserWindow, Display, screen } from 'electron';

import { createLogger } from '@/utils/logger';

import type { App } from '../App';

const logger = createLogger('core:WindowPositionManager');

export class WindowPositionManager {
  private window: BrowserWindow;
  private identifier: string;
  private app: App;

  constructor(window: BrowserWindow, identifier: string, app: App) {
    this.window = window;
    this.identifier = identifier;
    this.app = app;
  }

  /**
   * Determine window position based on parent window if exists
   */
  determinePosition(parentIdentifier?: string): void {
    if (!parentIdentifier) return;

    const parentWin = this.app.browserManager.retrieveByIdentifier(parentIdentifier as any);
    if (!parentWin) {
      logger.debug(`[${this.identifier}] Parent window ${parentIdentifier} not found`);
      return;
    }

    logger.debug(`[${this.identifier}] Found parent window: ${parentIdentifier}`);

    const display = screen.getDisplayNearestPoint(parentWin.browserWindow.getContentBounds());
    if (!display) {
      logger.debug(`[${this.identifier}] No display found for parent window`);
      return;
    }

    this.positionWindowOnDisplay(display);
  }

  private positionWindowOnDisplay(display: Display): void {
    const {
      workArea: { x, y, width: displayWidth, height: displayHeight },
    } = display;

    const { width, height } = this.window.getContentBounds();
    logger.debug(
      `[${this.identifier}] Display bounds: x=${x}, y=${y}, width=${displayWidth}, height=${displayHeight}`,
    );

    // Calculate centered position
    const newX = Math.floor(Math.max(x + (displayWidth - width) / 2, x));
    const newY = Math.floor(Math.max(y + (displayHeight - height) / 2, y));

    logger.debug(`[${this.identifier}] Calculated position: x=${newX}, y=${newY}`);
    this.window.setPosition(newX, newY, false);
  }

  /**
   * Center window on screen
   */
  centerWindow(): void {
    logger.debug(`Centering window: ${this.identifier}`);
    this.window?.center();
  }

  /**
   * Set window size with bounds validation
   */
  setSize(boundSize: { height?: number; width?: number }): void {
    logger.debug(
      `Setting window size for ${this.identifier}: width=${boundSize.width}, height=${boundSize.height}`,
    );

    if (!this.window || this.window.isDestroyed()) return;

    const currentBounds = this.window.getBounds();
    this.window.setBounds({
      height: boundSize.height || currentBounds.height,
      width: boundSize.width || currentBounds.width,
    });
  }
}
