import { BrowserWindow, shell } from 'electron';

import { createLogger } from '@/utils/logger';

const logger = createLogger('core:WindowWebRequestManager');

export class WindowWebRequestManager {
  private window: BrowserWindow;
  private identifier: string;

  constructor(window: BrowserWindow, identifier: string) {
    this.window = window;
    this.identifier = identifier;
    this.setupWebRequestHandlers();
  }

  /**
   * Setup web request handling for security and external links
   */
  private setupWebRequestHandlers(): void {
    this.setupNavigationHandling();
    this.setupWindowOpenHandler();
    this.setupWebRequestHeaders();
  }

  /**
   * Handle navigation events for external links
   */
  private setupNavigationHandling(): void {
    this.window.webContents.on('will-navigate', (event, url) => {
      // Allow localhost development URLs
      if (url.includes('localhost:') || url.includes('127.0.0.1:')) {
        logger.debug(`[${this.identifier}] Allowing localhost navigation: ${url}`);
        return;
      }

      // Prevent other navigation and open in external browser
      logger.debug(`[${this.identifier}] Intercepting external navigation: ${url}`);
      event.preventDefault();
      shell.openExternal(url);
    });
  }

  /**
   * Handle window.open requests
   */
  private setupWindowOpenHandler(): void {
    this.window.webContents.setWindowOpenHandler((details) => {
      const { url } = details;

      logger.debug(`[${this.identifier}] Window open request: ${url}`);

      // Handle file:// URLs by opening them with the system default application
      if (url.includes('http://file/')) {
        const fileName = url.replace('http://file/', '');
        logger.debug(`[${this.identifier}] Opening file with system app: ${fileName}`);
        // Note: This would need to be implemented with proper file path resolution
        shell
          .openPath(fileName)
          .catch((err) => logger.error(`[${this.identifier}] Failed to open file:`, err));
        return { action: 'deny' };
      }

      // For all other URLs, open in external browser
      logger.debug(`[${this.identifier}] Opening external URL: ${url}`);
      shell.openExternal(url);
      return { action: 'deny' };
    });
  }

  /**
   * Setup web request header filtering for security
   */
  private setupWebRequestHeaders(): void {
    this.window.webContents.session.webRequest.onHeadersReceived(
      { urls: ['*://*/*'] },
      (details, callback) => {
        // Remove X-Frame-Options headers to allow iframe embedding
        if (details.responseHeaders?.['X-Frame-Options']) {
          delete details.responseHeaders['X-Frame-Options'];
        }
        if (details.responseHeaders?.['x-frame-options']) {
          delete details.responseHeaders['x-frame-options'];
        }

        // Remove Content-Security-Policy headers that might block functionality
        if (details.responseHeaders?.['Content-Security-Policy']) {
          delete details.responseHeaders['Content-Security-Policy'];
        }
        if (details.responseHeaders?.['content-security-policy']) {
          delete details.responseHeaders['content-security-policy'];
        }

        logger.debug(
          `[${this.identifier}] Processed web request headers for: ${details.url.slice(0, 100)}...`,
        );

        callback({ cancel: false, responseHeaders: details.responseHeaders });
      },
    );
  }

  /**
   * Clean up web request handlers
   */
  cleanup(): void {
    // Web request handlers are automatically cleaned up when the session is destroyed
    logger.debug(`[${this.identifier}] WindowWebRequestManager cleanup completed`);
  }
}
