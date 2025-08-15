import { app } from 'electron';

import { isDev } from '@/const/env';
import { createLogger } from '@/utils/logger';
import { getProtocolScheme, parseProtocolUrl } from '@/utils/protocol';

import { App } from '../App';

// Create logger
const logger = createLogger('core:ProtocolManager');

/**
 * Protocol handler manager for custom URI schemes
 */
export class ProtocolManager {
  private app: App;
  private protocolScheme: string;
  private pendingUrls: string[] = [];

  constructor(app: App) {
    logger.debug('Initializing ProtocolManager');
    this.app = app;
    this.protocolScheme = getProtocolScheme();
    logger.info(`ProtocolManager initialized for scheme: ${this.protocolScheme}://`);
  }

  /**
   * Register protocol handlers and set up event listeners
   */
  public initialize(): void {
    logger.debug('Setting up protocol handlers');

    this.registerProtocolHandlers();
    this.setupEventListeners();

    logger.debug('Protocol initialization completed');
  }

  /**
   * Register the application as default protocol client
   */
  private registerProtocolHandlers(): void {
    logger.debug(`🔗 [Protocol] Registering protocol handlers for ${this.protocolScheme}://`);

    // Debug info about current app
    logger.debug(`🔗 [Protocol] App name: ${app.name}`);
    logger.debug(`🔗 [Protocol] App path: ${app.getPath('exe')}`);
    logger.debug(`🔗 [Protocol] Is development: ${isDev}`);
    logger.debug(`🔗 [Protocol] Process argv[0]: ${process.argv[0]}`);

    // Check if already registered
    const isCurrentlyRegistered = app.isDefaultProtocolClient(this.protocolScheme);
    logger.debug(`🔗 [Protocol] Is currently default protocol client: ${isCurrentlyRegistered}`);

    // Register as default protocol client
    let registrationResult: boolean;

    if (isDev) {
      // In development, use explicit parameters to ensure proper registration
      const appPath = process.cwd(); // Current working directory (our app)
      logger.debug(`🔗 [Protocol] Development mode: using explicit registration parameters`);
      logger.debug(`🔗 [Protocol] Executable path: ${process.execPath}`);
      logger.debug(`🔗 [Protocol] App path: ${appPath}`);
      logger.debug(`🔗 [Protocol] Arguments: ${JSON.stringify([appPath])}`);

      registrationResult = app.setAsDefaultProtocolClient(this.protocolScheme, process.execPath, [
        appPath,
      ]);
    } else {
      // In production, use simple registration
      registrationResult = app.setAsDefaultProtocolClient(this.protocolScheme);
    }

    logger.debug(`🔗 [Protocol] Registration result: ${registrationResult}`);

    if (!registrationResult) {
      logger.error(
        `🔗 [Protocol] Failed to register as default protocol client for ${this.protocolScheme}://`,
      );
    } else {
      logger.debug(`🔗 [Protocol] Successfully registered ${this.protocolScheme}:// protocol`);
    }

    // Verify registration
    const isRegisteredAfter = app.isDefaultProtocolClient(this.protocolScheme);
    logger.debug(`🔗 [Protocol] Final registration status: ${isRegisteredAfter}`);
  }

  /**
   * Set up protocol event listeners
   */
  private setupEventListeners(): void {
    // Handle protocol URL from cold start (Windows/Linux)
    const protocolUrl = this.getProtocolUrlFromArgs(process.argv);
    if (protocolUrl) {
      logger.debug(`🔗 [Protocol] Found protocol URL from cold start: ${protocolUrl}`);
      this.pendingUrls.push(protocolUrl);
    }

    // Handle protocol URL from macOS open-url event
    app.on('open-url', (event, url) => {
      event.preventDefault();
      logger.debug(`🔗 [Protocol] Received URL from open-url event: ${url}`);
      logger.debug(`🔗 [Protocol] App ready state: ${app.isReady()}`);
      logger.debug(`🔗 [Protocol] Event prevented, processing URL...`);
      this.handleProtocolUrl(url);
    });

    // Handle protocol URL from second instance (Windows/Linux)
    app.on('second-instance', (event, commandLine) => {
      const url = this.getProtocolUrlFromArgs(commandLine);
      if (url) {
        logger.debug(`🔗 [Protocol] Received protocol URL from second instance: ${url}`);
        this.handleProtocolUrl(url);
      }
      // Show main window when second instance is triggered
      this.app.browserManager.showMainWindow();
    });
  }

  /**
   * Extract protocol URL from command line arguments
   */
  private getProtocolUrlFromArgs(args: string[]): string | null {
    const protocolPrefix = `${this.protocolScheme}://`;

    logger.debug(`🔗 [Protocol] Searching for protocol URLs in args: ${JSON.stringify(args)}`);
    logger.debug(`🔗 [Protocol] Looking for prefix: ${protocolPrefix}`);

    for (const arg of args) {
      if (arg.startsWith(protocolPrefix)) {
        logger.debug(`🔗 [Protocol] Found protocol URL in args: ${arg}`);
        return arg;
      }
    }
    logger.debug(`🔗 [Protocol] No protocol URL found in args`);
    return null;
  }

  /**
   * Handle protocol URL - either immediately or store for later processing
   */
  private handleProtocolUrl(url: string): void {
    try {
      logger.debug(`🔗 [Protocol] handleProtocolUrl called with: ${url}`);
      logger.debug(`🔗 [Protocol] App ready state: ${app.isReady()}`);
      logger.debug(`🔗 [Protocol] Current pending URLs count: ${this.pendingUrls.length}`);

      if (!app.isReady()) {
        // App not ready yet, store for later processing
        logger.debug('🔗 [Protocol] App not ready, storing protocol URL for later processing');
        this.pendingUrls.push(url);
        logger.debug(`🔗 [Protocol] Pending URLs after push: ${this.pendingUrls.length}`);
        return;
      }

      // App is ready, process immediately
      logger.debug('🔗 [Protocol] App is ready, processing URL immediately');
      this.processProtocolUrl(url);
    } catch (error) {
      logger.error('🔗 [Protocol] Failed to handle protocol URL:', error);
    }
  }

  /**
   * Process protocol URL by showing main window and sending to renderer
   */
  private async processProtocolUrl(url: string): Promise<void> {
    try {
      logger.debug(`🔗 [Protocol] processProtocolUrl called with: ${url}`);

      // Basic URL validation - just check if it's our protocol
      if (!url.startsWith(`${this.protocolScheme}://`)) {
        logger.warn(`🔗 [Protocol] Invalid protocol scheme in URL: ${url}`);
        return;
      }

      // Show main window
      logger.debug('🔗 [Protocol] Showing main window...');
      this.app.browserManager.showMainWindow();

      // Parse protocol URL to extract urlType and action
      const parsed = parseProtocolUrl(url);

      if (!parsed) {
        logger.warn(`🔗 [Protocol] Failed to parse protocol URL: ${url}`);
        return;
      }

      logger.debug(
        `🔗 [Protocol] Parsed URL - type: ${parsed.urlType}, action: ${parsed.action}, data: %s`,
        parsed.params,
      );

      // Dispatch to registered protocol handlers via App with parsed data
      logger.debug('🔗 [Protocol] Dispatching to protocol handlers...');
      const handled = await this.app.handleProtocolRequest(
        parsed.urlType,
        parsed.action,
        parsed.params,
      );

      if (handled) {
        logger.debug('🔗 [Protocol] Protocol URL processed successfully by handler');
      } else {
        logger.warn(
          `🔗 [Protocol] No handler found for protocol: ${parsed.urlType}:${parsed.action}`,
        );
      }
    } catch (error) {
      logger.error('🔗 [Protocol] Failed to process protocol URL:', error);
      logger.error('🔗 [Protocol] Error details:', error);
    }
  }

  /**
   * Process any pending protocol URLs after app is ready
   */
  public async processPendingUrls(): Promise<void> {
    logger.debug(`🔗 [Protocol] processPendingUrls called`);
    logger.debug(`🔗 [Protocol] Pending URLs count: ${this.pendingUrls.length}`);

    if (this.pendingUrls.length === 0) {
      logger.debug(`🔗 [Protocol] No pending URLs to process`);
      return;
    }

    logger.debug(
      `🔗 [Protocol] Processing ${this.pendingUrls.length} pending protocol URLs:`,
      this.pendingUrls,
    );

    for (const url of this.pendingUrls) {
      logger.debug(`🔗 [Protocol] Processing pending URL: ${url}`);
      await this.processProtocolUrl(url);
    }

    // Clear pending URLs
    this.pendingUrls = [];
    logger.debug(`🔗 [Protocol] All pending URLs processed and cleared`);
  }

  /**
   * Get current protocol scheme
   */
  public getScheme(): string {
    return this.protocolScheme;
  }

  /**
   * Check if protocol is registered
   */
  public isRegistered(): boolean {
    return app.isDefaultProtocolClient(this.protocolScheme);
  }
}
