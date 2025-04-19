import { safeStorage } from 'electron';
import querystring from 'node:querystring';
import { URL } from 'node:url';

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
   * Get remote server configuration
   */
  @ipcClientEvent('getRemoteServerConfig')
  async getRemoteServerConfig() {
    logger.debug('Getting remote server configuration');
    const { storeManager } = this.app;

    const config = {
      active: storeManager.get('active', false),
      remoteServerUrl: storeManager.get('remoteServerUrl', ''),
    };

    logger.debug(`Remote server config: active=${config.active}, url=${config.remoteServerUrl}`);
    return config;
  }

  /**
   * Set remote server configuration
   */
  @ipcClientEvent('setRemoteServerConfig')
  async setRemoteServerConfig(config: { active: boolean; remoteServerUrl: string }) {
    logger.info(
      `Setting remote server config: active=${config.active}, url=${config.remoteServerUrl}`,
    );
    const { storeManager } = this.app;

    // Save configuration
    storeManager.set('remoteServerUrl', config.remoteServerUrl);
    storeManager.set('active', config.active);

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
    storeManager.delete('remoteServerUrl');
    storeManager.set('active', false);

    // Clear tokens (if any)
    await this.clearTokens();

    return true;
  }

  /**
   * Encrypted tokens
   * Tokens are only stored in memory, not persisted to storage
   */
  private encryptedAccessToken?: string;
  private encryptedRefreshToken?: string;

  /**
   * Whether token refresh is in progress
   */
  private isRefreshing = false;

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
  }

  /**
   * Get decrypted access token
   */
  async getAccessToken(): Promise<string | null> {
    logger.debug('Getting access token');
    if (!this.encryptedAccessToken) {
      logger.debug('No access token stored');
      return null;
    }

    // If platform doesn't support secure storage, return stored token
    if (!safeStorage.isEncryptionAvailable()) {
      logger.debug('Safe storage not available, returning unencrypted token');
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
    logger.debug('Getting refresh token');
    if (!this.encryptedRefreshToken) {
      logger.debug('No refresh token stored');
      return null;
    }

    // If platform doesn't support secure storage, return stored token
    if (!safeStorage.isEncryptionAvailable()) {
      logger.debug('Safe storage not available, returning unencrypted token');
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
  }

  /**
   * Get refresh status
   */
  isTokenRefreshing() {
    return this.isRefreshing;
  }

  /**
   * Set refresh status
   */
  setTokenRefreshing(status: boolean) {
    logger.debug(`Setting token refresh status: ${status}`);
    this.isRefreshing = status;
  }

  /**
   * 刷新访问令牌
   * 使用存储的刷新令牌获取新的访问令牌
   */
  @ipcClientEvent('refreshAccessToken')
  async refreshAccessToken() {
    try {
      logger.info('刷新访问令牌');

      // 检查是否已在刷新
      if (this.isTokenRefreshing()) {
        logger.warn('令牌刷新已在进行中');
        return { error: '令牌刷新已在进行中', success: false };
      }

      // 标记为正在刷新
      this.setTokenRefreshing(true);

      // 获取配置信息
      const config = await this.getRemoteServerConfig();

      if (!config.remoteServerUrl || !config.active) {
        throw new Error('远程服务器未激活');
      }

      // 获取刷新令牌
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('没有可用的刷新令牌');
      }

      // 构造刷新请求
      const tokenUrl = new URL('/oidc/token', config.remoteServerUrl);

      // 构造请求体
      const body = querystring.stringify({
        client_id: 'lobehub-desktop',
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      });

      logger.debug('发送令牌刷新请求');

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
        throw new Error(
          `刷新令牌失败: ${response.status} ${response.statusText} ${
            errorData.error_description || errorData.error || ''
          }`,
        );
      }

      // 解析响应
      const data = await response.json();

      // 确保响应包含必要的字段
      if (!data.access_token) {
        throw new Error('无效的令牌响应: 缺少必需字段');
      }

      logger.info('成功获取新的访问令牌');

      // 保存新令牌
      await this.saveTokens(
        data.access_token,
        data.refresh_token || refreshToken, // 如果没有新的刷新令牌，使用旧的
      );

      return { success: true };
    } catch (error) {
      logger.error('刷新令牌失败:', error);

      // 刷新失败，清除令牌并禁用远程服务器
      await this.clearTokens();
      const config = await this.getRemoteServerConfig();

      await this.setRemoteServerConfig({
        active: false,
        remoteServerUrl: config.remoteServerUrl || '',
      });

      return { error: error.message, success: false };
    } finally {
      // 标记为不再刷新
      this.setTokenRefreshing(false);
    }
  }
}
