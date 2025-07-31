import { DataSyncConfig } from '@lobechat/electron-client-ipc';
import { BrowserWindow, shell } from 'electron';
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
  private cachedRemoteUrl: string | null = null;

  /**
   * 自动刷新定时器
   */
  // eslint-disable-next-line no-undef
  private autoRefreshTimer: NodeJS.Timeout | null = null;

  /**
   * 构造 redirect_uri，确保授权和令牌交换时使用相同的 URI
   * @param remoteUrl 远程服务器 URL
   * @param includeHandoffId 是否包含 handoff ID（仅在授权时需要）
   */
  private constructRedirectUri(remoteUrl: string): string {
    const callbackUrl = new URL('/oidc/callback/desktop', remoteUrl);

    return callbackUrl.toString();
  }

  /**
   * Request OAuth authorization
   */
  @ipcClientEvent('requestAuthorization')
  async requestAuthorization(config: DataSyncConfig) {
    const remoteUrl = await this.remoteServerConfigCtr.getRemoteServerUrl(config);

    // 缓存远程服务器 URL 用于后续轮询
    this.cachedRemoteUrl = remoteUrl;

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

      // Construct authorization URL with new redirect_uri
      const authUrl = new URL('/oidc/auth', remoteUrl);
      const redirectUri = this.constructRedirectUri(remoteUrl);

      logger.info('redirectUri', redirectUri);

      // Add query parameters
      authUrl.search = querystring.stringify({
        client_id: 'lobehub-desktop',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        prompt: 'consent',
        redirect_uri: redirectUri,
        // https://github.com/lobehub/lobe-chat/pull/8450
        resource: 'urn:lobehub:chat',
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
    if (!this.authRequestState) {
      logger.error('No handoff ID available for polling');
      return;
    }

    logger.info('Starting credential polling');
    const pollInterval = 3000; // 3 seconds
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
  }

  /**
   * 启动自动刷新定时器
   */
  private startAutoRefresh() {
    // 先停止现有的定时器
    this.stopAutoRefresh();

    const checkInterval = 2 * 60 * 1000; // 每 2 分钟检查一次
    logger.debug('Starting auto-refresh timer');

    this.autoRefreshTimer = setInterval(async () => {
      try {
        // 检查 token 是否即将过期 (提前 5 分钟刷新)
        if (this.remoteServerConfigCtr.isTokenExpiringSoon()) {
          const expiresAt = this.remoteServerConfigCtr.getTokenExpiresAt();
          logger.info(
            `Token is expiring soon, triggering auto-refresh. Expires at: ${expiresAt ? new Date(expiresAt).toISOString() : 'unknown'}`,
          );

          const result = await this.remoteServerConfigCtr.refreshAccessToken();
          if (result.success) {
            logger.info('Auto-refresh successful');
            this.broadcastTokenRefreshed();
          } else {
            logger.error(`Auto-refresh failed: ${result.error}`);
            // 如果自动刷新失败，停止定时器并清除 token
            this.stopAutoRefresh();
            await this.remoteServerConfigCtr.clearTokens();
            await this.remoteServerConfigCtr.setRemoteServerConfig({ active: false });
            this.broadcastAuthorizationRequired();
          }
        }
      } catch (error) {
        logger.error('Error during auto-refresh check:', error);
      }
    }, checkInterval);
  }

  /**
   * 停止自动刷新定时器
   */
  private stopAutoRefresh() {
    if (this.autoRefreshTimer) {
      clearInterval(this.autoRefreshTimer);
      this.autoRefreshTimer = null;
      logger.debug('Stopped auto-refresh timer');
    }
  }

  /**
   * 轮询获取凭证
   * 直接发送 HTTP 请求到远程服务器
   */
  private async pollForCredentials(): Promise<{ code: string; state: string } | null> {
    if (!this.authRequestState || !this.cachedRemoteUrl) {
      return null;
    }

    try {
      // 使用缓存的远程服务器 URL
      const remoteUrl = this.cachedRemoteUrl;

      // 构造请求 URL
      const url = new URL('/oidc/handoff', remoteUrl);
      url.searchParams.set('id', this.authRequestState);
      url.searchParams.set('client', 'desktop');

      logger.debug(`Polling for credentials: ${url.toString()}`);

      // 直接发送 HTTP 请求
      const response = await fetch(url.toString(), {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'GET',
      });

      // 检查响应状态
      if (response.status === 404) {
        // 凭证还未准备好，这是正常情况
        return null;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // 解析响应数据
      const data = (await response.json()) as {
        data: {
          id: string;
          payload: { code: string; state: string };
        };
        success: boolean;
      };

      if (data.success && data.data?.payload) {
        logger.debug('Successfully retrieved credentials from handoff');
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
  async refreshAccessToken() {
    logger.info('Starting to refresh access token');
    try {
      // Call the centralized refresh logic in RemoteServerConfigCtr
      const result = await this.remoteServerConfigCtr.refreshAccessToken();

      if (result.success) {
        logger.info('Token refresh successful via AuthCtr call.');
        // Notify render process that token has been refreshed
        this.broadcastTokenRefreshed();
        // Restart auto-refresh timer with new expiration time
        this.startAutoRefresh();
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
      this.stopAutoRefresh();
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
    if (!this.cachedRemoteUrl) {
      throw new Error('No cached remote URL available for token exchange');
    }

    const remoteUrl = this.cachedRemoteUrl;
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
        redirect_uri: this.constructRedirectUri(remoteUrl),
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

      let data;

      // Parse response
      try {
        data = await response.clone().json();
      } catch {
        const status = response.status;

        throw new Error(
          `Parse JSON failed, please check your server, response status: ${status}, detail:\n\n ${await response.text()} `,
        );
      }

      logger.debug('Successfully received token exchange response');

      // Ensure response contains necessary fields
      if (!data.access_token || !data.refresh_token) {
        logger.error('Invalid token response: missing access_token or refresh_token');
        throw new Error('Invalid token response: missing required fields');
      }

      // Save tokens
      logger.debug('Starting to save exchanged tokens');
      await this.remoteServerConfigCtr.saveTokens(
        data.access_token,
        data.refresh_token,
        data.expires_in,
      );
      logger.info('Successfully saved exchanged tokens');

      // Set server to active state
      logger.debug(`Setting remote server to active state: ${remoteUrl}`);
      await this.remoteServerConfigCtr.setRemoteServerConfig({ active: true });

      // Start auto-refresh timer
      this.startAutoRefresh();

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

  /**
   * 应用启动后初始化
   */
  afterAppReady() {
    logger.debug('AuthCtr initialized, checking for existing tokens');
    this.initializeAutoRefresh();
  }

  /**
   * 清理所有定时器
   */
  cleanup() {
    logger.debug('Cleaning up AuthCtr timers');
    this.stopPolling();
    this.stopAutoRefresh();
  }

  /**
   * 初始化自动刷新功能
   * 在应用启动时检查是否有有效的 token，如果有就启动自动刷新定时器
   */
  private async initializeAutoRefresh() {
    try {
      const config = await this.remoteServerConfigCtr.getRemoteServerConfig();

      // 检查是否配置了远程服务器且处于活动状态
      if (!config.active || !config.remoteServerUrl) {
        logger.debug(
          'Remote server not active or configured, skipping auto-refresh initialization',
        );
        return;
      }

      // 检查是否有有效的访问令牌
      const accessToken = await this.remoteServerConfigCtr.getAccessToken();
      if (!accessToken) {
        logger.debug('No access token found, skipping auto-refresh initialization');
        return;
      }

      // 检查是否有过期时间信息
      const expiresAt = this.remoteServerConfigCtr.getTokenExpiresAt();
      if (!expiresAt) {
        logger.debug('No token expiration time found, skipping auto-refresh initialization');
        return;
      }

      // 检查 token 是否已经过期
      const currentTime = Date.now();
      if (currentTime >= expiresAt) {
        logger.info('Token has expired, attempting to refresh it');

        // 尝试刷新 token
        const refreshResult = await this.remoteServerConfigCtr.refreshAccessToken();
        if (refreshResult.success) {
          logger.info('Token refresh successful during initialization');
          this.broadcastTokenRefreshed();
          // 重新启动自动刷新定时器
          this.startAutoRefresh();
          return;
        } else {
          logger.error(`Token refresh failed during initialization: ${refreshResult.error}`);
          // 只有在刷新失败时才清除 token 并要求重新授权
          await this.remoteServerConfigCtr.clearTokens();
          await this.remoteServerConfigCtr.setRemoteServerConfig({ active: false });
          this.broadcastAuthorizationRequired();
          return;
        }
      }

      // 启动自动刷新定时器
      logger.info(
        `Token is valid, starting auto-refresh timer. Token expires at: ${new Date(expiresAt).toISOString()}`,
      );
      this.startAutoRefresh();
    } catch (error) {
      logger.error('Error during auto-refresh initialization:', error);
    }
  }
}
