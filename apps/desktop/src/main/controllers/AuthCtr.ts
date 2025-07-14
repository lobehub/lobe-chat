import { DataSyncConfig } from '@lobechat/electron-client-ipc';
import { BrowserWindow, shell } from 'electron';
import crypto from 'node:crypto';
import querystring from 'node:querystring';
import { URL } from 'node:url';

import { createLogger } from '@/utils/logger';

import RemoteServerConfigCtr from './RemoteServerConfigCtr';
import RemoteServerSyncCtr from './RemoteServerSyncCtr';
import { ControllerModule, ipcClientEvent } from './index';

// Create logger
const logger = createLogger('controllers:AuthCtr');

/**
 * Authentication Controller
 * 使用中间页 + 轮询的方式实现 OAuth 授权流程
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

  /**
   * 轮询相关参数
   */
  // eslint-disable-next-line no-undef
  private pollingInterval: NodeJS.Timeout | null = null;
  private handoffId: string | null = null;

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

      // Generate unique handoff ID for this authorization request
      this.handoffId = crypto.randomUUID();
      logger.debug(`Generated handoff ID: ${this.handoffId}`);

      // Construct authorization URL with new redirect_uri
      const authUrl = new URL('/oidc/auth', remoteUrl);
      const callbackUrl = new URL('/oauth/callback/desktop', remoteUrl);

      // Add handoff ID to callback URL
      callbackUrl.searchParams.set('id', this.handoffId);

      // Add query parameters
      authUrl.search = querystring.stringify({
        client_id: 'lobehub-desktop',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        prompt: 'consent',
        redirect_uri: callbackUrl.toString(),
        response_type: 'code',
        scope: 'profile email offline_access',
        state: this.authRequestState,
      });

      logger.info(`Constructed authorization URL: ${authUrl.toString()}`);

      // Open authorization URL in the default browser
      await shell.openExternal(authUrl.toString());
      logger.debug('Opening authorization URL in default browser');

      // Start polling for credentials
      this.startPolling();

      return { success: true };
    } catch (error) {
      logger.error('Authorization request failed:', error);
      return { error: error.message, success: false };
    }
  }

  /**
   * 启动轮询机制获取凭证
   */
  private startPolling() {
    if (!this.handoffId) {
      logger.error('No handoff ID available for polling');
      return;
    }

    logger.info('Starting credential polling');
    const pollInterval = 2000; // 2 seconds
    const maxPollTime = 5 * 60 * 1000; // 5 minutes
    const startTime = Date.now();

    this.pollingInterval = setInterval(async () => {
      try {
        // Check if polling has timed out
        if (Date.now() - startTime > maxPollTime) {
          logger.warn('Credential polling timed out');
          this.stopPolling();
          this.broadcastAuthorizationFailed('Authorization timed out');
          return;
        }

        // Poll for credentials
        const result = await this.pollForCredentials();

        if (result) {
          logger.info('Successfully received credentials from polling');
          this.stopPolling();

          // Validate state parameter
          if (result.state !== this.authRequestState) {
            logger.error(
              `Invalid state parameter: expected ${this.authRequestState}, received ${result.state}`,
            );
            this.broadcastAuthorizationFailed('Invalid state parameter');
            return;
          }

          // Exchange code for tokens
          const exchangeResult = await this.exchangeCodeForToken(result.code, this.codeVerifier!);

          if (exchangeResult.success) {
            logger.info('Authorization successful');
            this.broadcastAuthorizationSuccessful();
          } else {
            logger.warn(`Authorization failed: ${exchangeResult.error || 'Unknown error'}`);
            this.broadcastAuthorizationFailed(exchangeResult.error || 'Unknown error');
          }
        }
      } catch (error) {
        logger.error('Error during credential polling:', error);
        this.stopPolling();
        this.broadcastAuthorizationFailed('Polling error: ' + error.message);
      }
    }, pollInterval);
  }

  /**
   * 停止轮询
   */
  private stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }

    // Clear authorization request state
    this.authRequestState = null;
    this.codeVerifier = null;
    this.handoffId = null;
  }

  /**
   * 轮询获取凭证
   * 使用新的 REST API 接口查询远程服务器
   */
  private async pollForCredentials(): Promise<{ code: string; state: string } | null> {
    if (!this.handoffId) {
      return null;
    }

    try {
      // Use the existing proxy mechanism for the new REST API
      const remoteServerSyncCtr = this.app.getController(RemoteServerSyncCtr);
      if (!remoteServerSyncCtr) {
        throw new Error('RemoteServerSyncCtr not found');
      }

      // Construct the REST API request
      const restRequest = {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'GET' as const,
        urlPath: `/oidc/handoff?id=${encodeURIComponent(this.handoffId)}&client=desktop`,
      };

      const response = await remoteServerSyncCtr.proxyTRPCRequest(restRequest);

      // Check if the response indicates credentials are not ready
      if (response.status === 401 || response.status === 404) {
        return null;
      }

      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Parse the response body
      const bodyText =
        typeof response.body === 'string' ? response.body : Buffer.from(response.body).toString();

      const data = JSON.parse(bodyText);

      if (data.success && data.data?.payload) {
        return {
          code: data.data.payload.code,
          state: data.data.payload.state,
        };
      }

      return null;
    } catch (error) {
      logger.debug('Polling attempt failed (this is normal):', error.message);
      return null;
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
        redirect_uri: new URL('/oauth/callback/desktop', remoteUrl).toString(),
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
