import { BrowserWindow, ipcMain } from 'electron';
import { join } from 'node:path';

import { resourcesDir } from '@/const/dir';
import { RETRY_CONNECTION_CONFIG } from '@/const/theme';
import { createLogger } from '@/utils/logger';

const logger = createLogger('core:WindowErrorHandler');

export class WindowErrorHandler {
  private window: BrowserWindow;
  private identifier: string;
  private retryHandlerKey: string;

  constructor(window: BrowserWindow, identifier: string) {
    this.window = window;
    this.identifier = identifier;
    this.retryHandlerKey = `${RETRY_CONNECTION_CONFIG.RETRY_HANDLER_PREFIX}${identifier}`;
  }

  async handleLoadError(originalUrl: string): Promise<void> {
    try {
      logger.info(`[${this.identifier}] Attempting to load error page...`);
      await this.window.loadFile(join(resourcesDir, 'error.html'));
      logger.info(`[${this.identifier}] Error page loaded successfully.`);

      this.setupRetryHandler(originalUrl);
    } catch (err) {
      logger.error(`[${this.identifier}] Failed to load error page:`, err);
      await this.loadFallbackErrorPage();
    }
  }

  private setupRetryHandler(originalUrl: string): void {
    // Remove any existing retry handler for this instance
    this.cleanupRetryHandler();

    // Set retry logic with instance-specific handler
    ipcMain.handle(this.retryHandlerKey, async () => {
      logger.info(`[${this.identifier}] Retry connection requested for: ${originalUrl}`);

      try {
        await this.window?.loadURL(originalUrl);
        logger.info(`[${this.identifier}] Reconnection successful to ${originalUrl}`);
        this.cleanupRetryHandler();
        return { success: true };
      } catch (err) {
        logger.error(`[${this.identifier}] Retry connection failed for ${originalUrl}:`, err);
        await this.reloadErrorPage();
        return { error: err.message, success: false };
      }
    });

    logger.debug(`[${this.identifier}] Set up retry-connection handler: ${this.retryHandlerKey}`);
  }

  private async reloadErrorPage(): Promise<void> {
    try {
      logger.info(`[${this.identifier}] Reloading error page after failed retry...`);
      await this.window?.loadFile(join(resourcesDir, 'error.html'));
      logger.info(`[${this.identifier}] Error page reloaded.`);
    } catch (loadErr) {
      logger.error(`[${this.identifier}] Failed to reload error page:`, loadErr);
    }
  }

  private async loadFallbackErrorPage(): Promise<void> {
    try {
      logger.warn(`[${this.identifier}] Attempting to load fallback error HTML string...`);
      await this.window.loadURL(
        'data:text/html,<html><body><h1>Loading Failed</h1><p>Unable to connect to server, please restart the application</p></body></html>',
      );
      logger.info(`[${this.identifier}] Fallback error HTML string loaded.`);
    } catch (finalErr) {
      logger.error(`[${this.identifier}] Unable to display any page:`, finalErr);
    }
  }

  cleanupRetryHandler(): void {
    if (ipcMain.listenerCount(this.retryHandlerKey) > 0) {
      ipcMain.removeHandler(this.retryHandlerKey);
      logger.debug(`[${this.identifier}] Cleaned up retry handler: ${this.retryHandlerKey}`);
    }
  }
}
