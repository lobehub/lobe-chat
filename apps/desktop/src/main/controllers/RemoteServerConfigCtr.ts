import { DataSyncConfig } from '@lobechat/electron-client-ipc';
import { safeStorage } from 'electron';
import querystring from 'node:querystring';
import { URL } from 'node:url';

import { OFFICIAL_CLOUD_SERVER } from '@/const/env';
import { createLogger } from '@/utils/logger';

import { ControllerModule, ipcClientEvent } from './index';

// Create logger
const logger = createLogger('controllers:RemoteServerConfigCtr');

/**
 * Remote Server Configuration Controller
 * Used to manage custom remote LobeChat server configuration
 */
export default class RemoteServerConfigCtr extends ControllerModule {
  /**
   * Key used to store encrypted tokens in electron-store.
   */
  private readonly encryptedTokensKey = 'encryptedTokens';

  /**
   * Get remote server configuration
   */
  @ipcClientEvent('getRemoteServerConfig')
  async getRemoteServerConfig() {
    logger.debug('Getting remote server configuration');
    const { storeManager } = this.app;

    const config: DataSyncConfig = storeManager.get('dataSyncConfig');

    logger.debug(
      `Remote server config: active=${config.active}, storageMode=${config.storageMode}, url=${config.remoteServerUrl}`,
    );

    return config;
  }

  /**
   * Set remote server configuration
   */
  @ipcClientEvent('setRemoteServerConfig')
  async setRemoteServerConfig(config: Partial<DataSyncConfig>) {
    logger.info(
      `Setting remote server storageMode: active=${config.active}, storageMode=${config.storageMode}, url=${config.remoteServerUrl}`,
    );
    const { storeManager } = this.app;
    const prev: DataSyncConfig = storeManager.get('dataSyncConfig');

    // Save configuration
    storeManager.set('dataSyncConfig', { ...prev, ...config });

    return true;
  }

  /**
   * Clear remote server configuration
   */
  @ipcClientEvent('clearRemoteServerConfig')
  async clearRemoteServerConfig() {
    logger.info('Clearing remote server configuration');
    const { storeManager } = this.app;

    // Clear instance configuration
    storeManager.set('dataSyncConfig', { storageMode: 'local' });

    // Clear tokens (if any)
    await this.clearTokens();

    return true;
  }

  /**
   * Encrypted tokens
   * Stored in memory for quick access, loaded from persistent storage on init.
   */
  private encryptedAccessToken?: string;
  private encryptedRefreshToken?: string;

  /**
   * Promise representing the ongoing token refresh operation.
   * Used to prevent concurrent refreshes and allow callers to wait.
   */
  private refreshPromise: Promise<{ error?: string; success: boolean }> | null = null;

  /**
   * Encrypt and store tokens
   * @param accessToken Access token
   * @param refreshToken Refresh token
   */
  async saveTokens(accessToken: string, refreshToken: string) {
    logger.info('Saving encrypted tokens');

    // If platform doesn't support secure storage, store raw tokens
    if (!safeStorage.isEncryptionAvailable()) {
      logger.warn('Safe storage not available, storing tokens unencrypted');
      this.encryptedAccessToken = accessToken;
      this.encryptedRefreshToken = refreshToken;
      // Persist unencrypted tokens (consider security implications)
      this.app.storeManager.set(this.encryptedTokensKey, {
        accessToken: this.encryptedAccessToken,
        refreshToken: this.encryptedRefreshToken,
      });
      return;
    }

    // Encrypt tokens
    logger.debug('Encrypting tokens using safe storage');
    this.encryptedAccessToken = Buffer.from(safeStorage.encryptString(accessToken)).toString(
      'base64',
    );

    this.encryptedRefreshToken = Buffer.from(safeStorage.encryptString(refreshToken)).toString(
      'base64',
    );

    // Persist encrypted tokens
    logger.debug(`Persisting encrypted tokens to store key: ${this.encryptedTokensKey}`);
    this.app.storeManager.set(this.encryptedTokensKey, {
      accessToken: this.encryptedAccessToken,
      refreshToken: this.encryptedRefreshToken,
    });
  }

  /**
   * Get decrypted access token
   */
  async getAccessToken(): Promise<string | null> {
    // Try loading from memory first
    if (!this.encryptedAccessToken) {
      logger.debug('Access token not in memory, trying to load from store...');
      this.loadTokensFromStore(); // Attempt to load from persistent storage
    }

    if (!this.encryptedAccessToken) {
      logger.debug('No access token found in memory or store.');
      return null;
    }

    // If platform doesn't support secure storage, return stored token
    if (!safeStorage.isEncryptionAvailable()) {
      logger.debug(
        'Safe storage not available, returning potentially unencrypted token from memory/store',
      );
      return this.encryptedAccessToken;
    }

    try {
      // Decrypt token
      logger.debug('Decrypting access token');
      const encryptedData = Buffer.from(this.encryptedAccessToken, 'base64');
      return safeStorage.decryptString(encryptedData);
    } catch (error) {
      logger.error('Failed to decrypt access token:', error);
      return null;
    }
  }

  /**
   * Get decrypted refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    // Try loading from memory first
    if (!this.encryptedRefreshToken) {
      logger.debug('Refresh token not in memory, trying to load from store...');
      this.loadTokensFromStore(); // Attempt to load from persistent storage
    }

    if (!this.encryptedRefreshToken) {
      logger.debug('No refresh token found in memory or store.');
      return null;
    }

    // If platform doesn't support secure storage, return stored token
    if (!safeStorage.isEncryptionAvailable()) {
      logger.debug(
        'Safe storage not available, returning potentially unencrypted token from memory/store',
      );
      return this.encryptedRefreshToken;
    }

    try {
      // Decrypt token
      logger.debug('Decrypting refresh token');
      const encryptedData = Buffer.from(this.encryptedRefreshToken, 'base64');
      return safeStorage.decryptString(encryptedData);
    } catch (error) {
      logger.error('Failed to decrypt refresh token:', error);
      return null;
    }
  }

  /**
   * Clear tokens
   */
  async clearTokens() {
    logger.info('Clearing access and refresh tokens');
    this.encryptedAccessToken = undefined;
    this.encryptedRefreshToken = undefined;
    // Also clear from persistent storage
    logger.debug(`Deleting tokens from store key: ${this.encryptedTokensKey}`);
    this.app.storeManager.delete(this.encryptedTokensKey);
  }

  /**
   * 刷新访问令牌
   * 使用存储的刷新令牌获取新的访问令牌
   * Handles concurrent requests by returning the existing refresh promise if one is in progress.
   */
  @ipcClientEvent('refreshAccessToken')
  async refreshAccessToken(): Promise<{ error?: string; success: boolean }> {
    // If a refresh is already in progress, return the existing promise
    if (this.refreshPromise) {
      logger.debug('Token refresh already in progress, returning existing promise.');
      return this.refreshPromise;
    }

    // Start a new refresh operation
    logger.info('Initiating new token refresh operation.');
    this.refreshPromise = this.performTokenRefresh();

    // Return the promise so callers can wait
    return this.refreshPromise;
  }

  /**
   * Performs the actual token refresh logic.
   * This method is called by refreshAccessToken and wrapped in a promise.
   */
  private async performTokenRefresh(): Promise<{ error?: string; success: boolean }> {
    try {
      // 获取配置信息
      const config = await this.getRemoteServerConfig();

      if (!config.remoteServerUrl || !config.active) {
        logger.warn('Remote server not active or configured, skipping refresh.');
        return { error: '远程服务器未激活或未配置', success: false };
      }

      // 获取刷新令牌
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) {
        logger.error('No refresh token available for refresh operation.');
        return { error: '没有可用的刷新令牌', success: false };
      }

      // 构造刷新请求
      const remoteUrl = await this.getRemoteServerUrl(config);

      const tokenUrl = new URL('/oidc/token', remoteUrl);

      // 构造请求体
      const body = querystring.stringify({
        client_id: 'lobehub-desktop',
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      });

      logger.debug(`Sending token refresh request to ${tokenUrl.toString()}`);

      // 发送请求
      const response = await fetch(tokenUrl.toString(), {
        body,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        method: 'POST',
      });

      if (!response.ok) {
        // 尝试解析错误响应
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = `刷新令牌失败: ${response.status} ${response.statusText} ${
          errorData.error_description || errorData.error || ''
        }`.trim();
        logger.error(errorMessage, errorData);
        return { error: errorMessage, success: false };
      }

      // 解析响应
      const data = await response.json();

      // 检查响应中是否包含必要令牌
      if (!data.access_token || !data.refresh_token) {
        logger.error('Refresh response missing access_token or refresh_token', data);
        return { error: '刷新响应中缺少令牌', success: false };
      }

      // 保存新令牌
      logger.info('Token refresh successful, saving new tokens.');
      await this.saveTokens(data.access_token, data.refresh_token);

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Exception during token refresh operation:', errorMessage, error);
      return { error: `刷新令牌时发生异常: ${errorMessage}`, success: false };
    } finally {
      // Ensure the promise reference is cleared once the operation completes
      logger.debug('Clearing the refresh promise reference.');
      this.refreshPromise = null;
    }
  }

  /**
   * Load encrypted tokens from persistent storage (electron-store) into memory.
   * This should be called during initialization or if memory tokens are missing.
   */
  private loadTokensFromStore() {
    logger.debug(`Attempting to load tokens from store key: ${this.encryptedTokensKey}`);
    const storedTokens = this.app.storeManager.get(this.encryptedTokensKey);

    if (storedTokens && storedTokens.accessToken && storedTokens.refreshToken) {
      logger.info('Successfully loaded tokens from store into memory.');
      this.encryptedAccessToken = storedTokens.accessToken;
      this.encryptedRefreshToken = storedTokens.refreshToken;
    } else {
      logger.debug('No valid tokens found in store.');
    }
  }

  // Initialize by loading tokens from store when the controller is ready
  // We might need a dedicated lifecycle method if constructor is too early for storeManager
  afterAppReady() {
    this.loadTokensFromStore();
  }

  async getRemoteServerUrl(config?: DataSyncConfig) {
    const dataConfig = config ? config : await this.getRemoteServerConfig();

    return dataConfig.storageMode === 'cloud' ? OFFICIAL_CLOUD_SERVER : dataConfig.remoteServerUrl;
  }
}
