import { BrowserWindow, app, shell } from 'electron';
import crypto from 'node:crypto';
import querystring from 'node:querystring';
import { URL } from 'node:url';

import { createLogger } from '@/utils/logger';

import RemoteServerConfigCtr from './RemoteServerConfigCtr';
import { ControllerModule, ipcClientEvent } from './index';

// Create logger
const logger = createLogger('controllers:AuthCtr');

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
  async requestAuthorization(serverUrl: string) {
    logger.info(`Requesting OAuth authorization, server URL: ${serverUrl}`);
    try {
      // First, update the server URL configuration
      logger.debug('Setting remote server configuration');
      await this.remoteServerConfigCtr.setRemoteServerConfig({
        active: false,
        remoteServerUrl: serverUrl, // Set to true after successful authorization
      });

      // Generate PKCE parameters
      logger.debug('Generating PKCE parameters');
      const codeVerifier = this.generateCodeVerifier();
      const codeChallenge = await this.generateCodeChallenge(codeVerifier);
      this.codeVerifier = codeVerifier;

      // Generate state parameter to prevent CSRF attacks
      this.authRequestState = crypto.randomBytes(16).toString('hex');
      logger.debug(`Generated state parameter: ${this.authRequestState}`);

      // Construct authorization URL
      const authUrl = new URL('/oidc/auth', serverUrl);

      // Add query parameters
      authUrl.search = querystring.stringify({
        client_id: 'lobehub-desktop',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        prompt: 'consent',
        redirect_uri: 'com.lobehub.desktop://auth/callback',
        response_type: 'code',
        scope: 'openid profile email offline_access sync:read sync:write',
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

      if (!config.remoteServerUrl) {
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
      const result = await this.exchangeCodeForToken(config.remoteServerUrl, code, codeVerifier);

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
      // Check if already refreshing
      if (this.remoteServerConfigCtr.isTokenRefreshing()) {
        logger.warn('Token refresh already in progress');
        return { error: 'Token refresh already in progress', success: false };
      }

      // Mark as refreshing
      this.remoteServerConfigCtr.setTokenRefreshing(true);
      logger.debug('Marking as refreshing token');

      // Get configuration information
      const config = await this.remoteServerConfigCtr.getRemoteServerConfig();
      logger.debug(
        `Getting remote server configuration: url=${config.remoteServerUrl}, active=${config.active}`,
      );

      if (!config.remoteServerUrl || !config.active) {
        logger.error('Remote server not active');
        throw new Error('Remote server not active');
      }

      // Get refresh token
      const refreshToken = await this.remoteServerConfigCtr.getRefreshToken();
      if (!refreshToken) {
        logger.error('No refresh token available');
        throw new Error('No refresh token available');
      }
      logger.debug('Successfully retrieved refresh token');

      // Construct refresh request
      const tokenUrl = new URL('/oidc/token', config.remoteServerUrl);

      // Construct request body
      const body = querystring.stringify({
        client_id: 'lobehub-desktop',
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      });

      logger.debug(`Sending token refresh request to ${tokenUrl.toString()}`);
      // Send request
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
        const errorMessage = `Failed to refresh token: ${response.status} ${response.statusText} ${errorData.error_description || errorData.error || ''}`;
        logger.error(errorMessage);
        throw new Error(errorMessage);
      }

      // Parse response
      const data = await response.json();
      logger.debug('Successfully received token refresh response');

      // Ensure response contains necessary fields
      if (!data.access_token) {
        logger.error('Invalid token response: missing access_token');
        throw new Error('Invalid token response: missing required fields');
      }

      // Save new tokens
      logger.debug('Starting to save new tokens');
      await this.remoteServerConfigCtr.saveTokens(
        data.access_token,
        data.refresh_token || refreshToken, // Use old refresh token if no new one is provided
      );
      logger.info('Successfully refreshed and saved tokens');

      // Notify render process that token has been refreshed
      this.broadcastTokenRefreshed();

      return { success: true };
    } catch (error) {
      logger.error('Token refresh operation failed:', error);

      // Refresh failed, clear tokens and disable remote server
      logger.warn('Refresh failed, clearing tokens and disabling remote server');
      await this.remoteServerConfigCtr.clearTokens();
      const currentConfig = await this.remoteServerConfigCtr
        .getRemoteServerConfig()
        .catch(() => ({ remoteServerUrl: '' })); // Handle potential error getting config
      await this.remoteServerConfigCtr.setRemoteServerConfig({
        active: false,
        remoteServerUrl: currentConfig.remoteServerUrl || '',
      });

      // Notify render process that re-authorization is required
      this.broadcastAuthorizationRequired();

      return { error: error.message, success: false };
    } finally {
      // Mark as no longer refreshing
      this.remoteServerConfigCtr.setTokenRefreshing(false);
      logger.debug('Marking as no longer refreshing token');
    }
  }

  /**
   * Register custom protocol handler
   */
  private registerProtocolHandler() {
    logger.info('Registering custom protocol handler com.lobehub.desktop://');
    // Use app.setAsDefaultProtocolClient on Windows and Linux
    app.setAsDefaultProtocolClient('com.lobehub.desktop');

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
        const url = commandLine.find((arg) => arg.startsWith('com.lobehub.desktop://'));
        if (url) {
          logger.info(`Found URL from second-instance command line arguments: ${url}`);
          this.handleAuthCallback(url);
        } else {
          logger.warn('Protocol URL not found in second-instance command line arguments');
        }
      });
    }

    logger.info('Registered com.lobehub.desktop:// custom protocol handler');
  }

  /**
   * Exchange authorization code for token
   */
  private async exchangeCodeForToken(serverUrl: string, code: string, codeVerifier: string) {
    logger.info('Starting to exchange authorization code for token');
    try {
      const tokenUrl = new URL('/oidc/token', serverUrl);
      logger.debug(`Constructed token exchange URL: ${tokenUrl.toString()}`);

      // Construct request body
      const body = querystring.stringify({
        client_id: 'lobehub-desktop',
        code,
        code_verifier: codeVerifier,
        grant_type: 'authorization_code',
        redirect_uri: 'com.lobehub.desktop://auth/callback',
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
      logger.debug(`Setting remote server to active state: ${serverUrl}`);
      await this.remoteServerConfigCtr.setRemoteServerConfig({
        active: true,
        remoteServerUrl: serverUrl,
      });

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
