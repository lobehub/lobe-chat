import { DataSyncConfig } from '@lobechat/electron-client-ipc';
import { BrowserWindow, app, shell } from 'electron';
import crypto from 'node:crypto';
import querystring from 'node:querystring';
import { URL } from 'node:url';

import { name } from '@/../../package.json';
import { createLogger } from '@/utils/logger';

import RemoteServerConfigCtr from './RemoteServerConfigCtr';
import { ControllerModule, ipcClientEvent } from './index';

// Create logger
const logger = createLogger('controllers:AuthCtr');

const protocolPrefix = `com.lobehub.${name}`;
/**
 * Authentication Controller
 * Used to implement the OAuth authorization flow
 */
export default class AuthCtr extends ControllerModule {
  /**
   * 远程服务器配置控制器
   */
  private get remoteServerConfigCtr() {
    return this.app.getController(RemoteServerConfigCtr);
  }

  /**
   * 当前的 PKCE 参数
   */
  private codeVerifier: string | null = null;
  private authRequestState: string | null = null;

  beforeAppReady = () => {
    this.registerProtocolHandler();
  };

  /**
   * Request OAuth authorization
   */
  @ipcClientEvent('requestAuthorization')
  async requestAuthorization(config: DataSyncConfig) {
    const remoteUrl = await this.remoteServerConfigCtr.getRemoteServerUrl(config);

    logger.info(
      `Requesting OAuth authorization, storageMode:${config.storageMode} server URL: ${remoteUrl}`,
    );
    try {
      // Generate PKCE parameters
      logger.debug('Generating PKCE parameters');
      const codeVerifier = this.generateCodeVerifier();
      const codeChallenge = await this.generateCodeChallenge(codeVerifier);
      this.codeVerifier = codeVerifier;

      // Generate state parameter to prevent CSRF attacks
      this.authRequestState = crypto.randomBytes(16).toString('hex');
      logger.debug(`Generated state parameter: ${this.authRequestState}`);

      // Construct authorization URL
      const authUrl = new URL('/oidc/auth', remoteUrl);

      // Add query parameters
      authUrl.search = querystring.stringify({
        client_id: 'lobehub-desktop',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        prompt: 'consent',
        redirect_uri: `${protocolPrefix}://auth/callback`,
        response_type: 'code',
        scope: 'profile email offline_access',
        state: this.authRequestState,
      });

      logger.info(`Constructed authorization URL: ${authUrl.toString()}`);

      // Open authorization URL in the default browser
      await shell.openExternal(authUrl.toString());
      logger.debug('Opening authorization URL in default browser');

      return { success: true };
    } catch (error) {
      logger.error('Authorization request failed:', error);
      return { error: error.message, success: false };
    }
  }

  /**
   * Handle authorization callback
   * This method is called when the browser redirects to our custom protocol
   */
  async handleAuthCallback(callbackUrl: string) {
    logger.info(`Handling authorization callback: ${callbackUrl}`);
    try {
      const url = new URL(callbackUrl);
      const params = new URLSearchParams(url.search);

      // Get authorization code
      const code = params.get('code');
      const state = params.get('state');
      logger.debug(`Got parameters from callback URL: code=${code}, state=${state}`);

      // Validate state parameter to prevent CSRF attacks
      if (state !== this.authRequestState) {
        logger.error(
          `Invalid state parameter: expected ${this.authRequestState}, received ${state}`,
        );
        throw new Error('Invalid state parameter');
      }
      logger.debug('State parameter validation passed');

      if (!code) {
        logger.error('No authorization code received');
        throw new Error('No authorization code received');
      }

      // Get configuration information
      const config = await this.remoteServerConfigCtr.getRemoteServerConfig();
      logger.debug(`Getting remote server configuration: url=${config.remoteServerUrl}`);

      if (config.storageMode === 'selfHost' && !config.remoteServerUrl) {
        logger.error('Server URL not configured');
        throw new Error('No server URL configured');
      }

      // Get the previously saved code_verifier
      const codeVerifier = this.codeVerifier;
      if (!codeVerifier) {
        logger.error('Code verifier not found');
        throw new Error('No code verifier found');
      }
      logger.debug('Found code verifier');

      // Exchange authorization code for token
      logger.debug('Starting to exchange authorization code for token');
      const result = await this.exchangeCodeForToken(code, codeVerifier);

      if (result.success) {
        logger.info('Authorization successful');
        // Notify render process of successful authorization
        this.broadcastAuthorizationSuccessful();
      } else {
        logger.warn(`Authorization failed: ${result.error || 'Unknown error'}`);
        // Notify render process of failed authorization
        this.broadcastAuthorizationFailed(result.error || 'Unknown error');
      }

      return result;
    } catch (error) {
      logger.error('Handling authorization callback failed:', error);

      // Notify render process of failed authorization
      this.broadcastAuthorizationFailed(error.message);

      return { error: error.message, success: false };
    } finally {
      // Clear authorization request state
      logger.debug('Clearing authorization request state');
      this.authRequestState = null;
      this.codeVerifier = null;
    }
  }

  /**
   * Refresh access token
   */
  @ipcClientEvent('refreshAccessToken')
  async refreshAccessToken() {
    logger.info('Starting to refresh access token');
    try {
      // Call the centralized refresh logic in RemoteServerConfigCtr
      const result = await this.remoteServerConfigCtr.refreshAccessToken();

      if (result.success) {
        logger.info('Token refresh successful via AuthCtr call.');
        // Notify render process that token has been refreshed
        this.broadcastTokenRefreshed();
        return { success: true };
      } else {
        // Throw an error to be caught by the catch block below
        // This maintains the existing behavior of clearing tokens on failure
        logger.error(`Token refresh failed via AuthCtr call: ${result.error}`);
        throw new Error(result.error || 'Token refresh failed');
      }
    } catch (error) {
      // Keep the existing logic to clear tokens and require re-auth on failure
      logger.error('Token refresh operation failed via AuthCtr, initiating cleanup:', error);

      // Refresh failed, clear tokens and disable remote server
      logger.warn('Refresh failed, clearing tokens and disabling remote server');
      await this.remoteServerConfigCtr.clearTokens();
      await this.remoteServerConfigCtr.setRemoteServerConfig({ active: false });

      // Notify render process that re-authorization is required
      this.broadcastAuthorizationRequired();

      return { error: error.message, success: false };
    }
  }

  /**
   * Register custom protocol handler
   */
  private registerProtocolHandler() {
    logger.info(`Registering custom protocol handler ${protocolPrefix}://`);
    app.setAsDefaultProtocolClient(protocolPrefix);

    // Register custom protocol handler
    if (process.platform === 'darwin') {
      // Handle open-url event on macOS
      logger.debug('Registering open-url event handler for macOS');
      app.on('open-url', (event, url) => {
        event.preventDefault();
        logger.info(`Received open-url event: ${url}`);
        this.handleAuthCallback(url);
      });
    } else {
      // Handle protocol callback via second-instance event on Windows and Linux
      logger.debug('Registering second-instance event handler for Windows/Linux');
      app.on('second-instance', (event, commandLine) => {
        // Find the URL from command line arguments
        const url = commandLine.find((arg) => arg.startsWith(`${protocolPrefix}://`));
        if (url) {
          logger.info(`Found URL from second-instance command line arguments: ${url}`);
          this.handleAuthCallback(url);
        } else {
          logger.warn('Protocol URL not found in second-instance command line arguments');
        }
      });
    }

    logger.info(`Registered ${protocolPrefix}:// custom protocol handler`);
  }

  /**
   * Exchange authorization code for token
   */
  private async exchangeCodeForToken(code: string, codeVerifier: string) {
    const remoteUrl = await this.remoteServerConfigCtr.getRemoteServerUrl();
    logger.info('Starting to exchange authorization code for token');
    try {
      const tokenUrl = new URL('/oidc/token', remoteUrl);
      logger.debug(`Constructed token exchange URL: ${tokenUrl.toString()}`);

      // Construct request body
      const body = querystring.stringify({
        client_id: 'lobehub-desktop',
        code,
        code_verifier: codeVerifier,
        grant_type: 'authorization_code',
        redirect_uri: `${protocolPrefix}://auth/callback`,
      });

      logger.debug('Sending token exchange request');
      // Send request to get token
      const response = await fetch(tokenUrl.toString(), {
        body,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        method: 'POST',
      });

      if (!response.ok) {
        // Try parsing the error response
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = `Failed to get token: ${response.status} ${response.statusText} ${errorData.error_description || errorData.error || ''}`;
        logger.error(errorMessage);
        throw new Error(errorMessage);
      }

      // Parse response
      const data = await response.json();
      logger.debug('Successfully received token exchange response');
      // console.log(data); // Keep original log for debugging, or remove/change to logger.debug as needed

      // Ensure response contains necessary fields
      if (!data.access_token || !data.refresh_token) {
        logger.error('Invalid token response: missing access_token or refresh_token');
        throw new Error('Invalid token response: missing required fields');
      }

      // Save tokens
      logger.debug('Starting to save exchanged tokens');
      await this.remoteServerConfigCtr.saveTokens(data.access_token, data.refresh_token);
      logger.info('Successfully saved exchanged tokens');

      // Set server to active state
      logger.debug(`Setting remote server to active state: ${remoteUrl}`);
      await this.remoteServerConfigCtr.setRemoteServerConfig({ active: true });

      return { success: true };
    } catch (error) {
      logger.error('Exchanging authorization code failed:', error);
      return { error: error.message, success: false };
    }
  }

  /**
   * Broadcast token refreshed event
   */
  private broadcastTokenRefreshed() {
    logger.debug('Broadcasting tokenRefreshed event to all windows');
    const allWindows = BrowserWindow.getAllWindows();

    for (const win of allWindows) {
      if (!win.isDestroyed()) {
        win.webContents.send('tokenRefreshed');
      }
    }
  }

  /**
   * Broadcast authorization successful event
   */
  private broadcastAuthorizationSuccessful() {
    logger.debug('Broadcasting authorizationSuccessful event to all windows');
    const allWindows = BrowserWindow.getAllWindows();

    for (const win of allWindows) {
      if (!win.isDestroyed()) {
        win.webContents.send('authorizationSuccessful');
      }
    }
  }

  /**
   * Broadcast authorization failed event
   */
  private broadcastAuthorizationFailed(error: string) {
    logger.debug(`Broadcasting authorizationFailed event to all windows, error: ${error}`);
    const allWindows = BrowserWindow.getAllWindows();

    for (const win of allWindows) {
      if (!win.isDestroyed()) {
        win.webContents.send('authorizationFailed', { error });
      }
    }
  }

  /**
   * Broadcast authorization required event
   */
  private broadcastAuthorizationRequired() {
    logger.debug('Broadcasting authorizationRequired event to all windows');
    const allWindows = BrowserWindow.getAllWindows();

    for (const win of allWindows) {
      if (!win.isDestroyed()) {
        win.webContents.send('authorizationRequired');
      }
    }
  }

  /**
   * Generate PKCE codeVerifier
   */
  private generateCodeVerifier(): string {
    logger.debug('Generating PKCE code verifier');
    // Generate a random string of at least 43 characters
    const verifier = crypto
      .randomBytes(32)
      .toString('base64')
      .replaceAll('+', '-')
      .replaceAll('/', '_')
      .replace(/=+$/, '');
    logger.debug('Generated code verifier (partial): ' + verifier.slice(0, 10) + '...'); // Avoid logging full sensitive info
    return verifier;
  }

  /**
   * Generate codeChallenge from codeVerifier (S256 method)
   */
  private async generateCodeChallenge(codeVerifier: string): Promise<string> {
    logger.debug('Generating PKCE code challenge (S256)');
    // Hash codeVerifier using SHA-256
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);

    // Convert hash result to base64url encoding
    const challenge = Buffer.from(digest)
      .toString('base64')
      .replaceAll('+', '-')
      .replaceAll('/', '_')
      .replace(/=+$/, '');
    logger.debug('Generated code challenge (partial): ' + challenge.slice(0, 10) + '...'); // Avoid logging full sensitive info
    return challenge;
  }
}
