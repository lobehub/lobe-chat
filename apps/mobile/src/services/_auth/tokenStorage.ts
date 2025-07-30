import * as SecureStore from 'expo-secure-store';
import type { Token } from '@/types/user';
import { authLogger } from '@/utils/logger';

// 存储键名
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'lobe_chat_access_token',
  ID_TOKEN: 'lobe_chat_id_token',
  REFRESH_TOKEN: 'lobe_chat_refresh_token',
  TOKEN_DATA: 'lobe_chat_token_data',
  USER_DATA: 'lobe_chat_user_data',
} as const;

// 安全存储选项
const SECURE_STORE_OPTIONS = {
  keychainService: 'lobe-chat-auth',
  requireAuthentication: false,
} as const;

export const TokenStorage = {
  /**
   * 清除所有认证数据
   */
  async clearAll(): Promise<void> {
    authLogger.info('Clearing all auth data');
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN_DATA, SECURE_STORE_OPTIONS),
        SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA, SECURE_STORE_OPTIONS),
      ]);
      authLogger.info('Auth data cleared successfully');
    } catch (error) {
      authLogger.error('Failed to clear auth data', error);
      console.error('Failed to clear auth data:', error);
      // 不抛出错误，因为清除失败不应该阻止用户操作
    }
  },

  /**
   * 仅获取访问令牌
   */
  async getAccessToken(): Promise<string | null> {
    try {
      const token = await this.getToken();
      return token?.accessToken || null;
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  },

  /**
   * 仅获取刷新令牌
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      const token = await this.getToken();
      return token?.refreshToken || null;
    } catch (error) {
      console.error('Failed to get refresh token:', error);
      return null;
    }
  },

  /**
   * 获取完整的 token 数据
   */
  async getToken(): Promise<Token | null> {
    authLogger.info('Getting token from storage');
    try {
      const tokenData = await SecureStore.getItemAsync(
        STORAGE_KEYS.TOKEN_DATA,
        SECURE_STORE_OPTIONS,
      );
      const hasToken = !!tokenData;
      authLogger.info('Token retrieval result', { hasToken });
      return tokenData ? JSON.parse(tokenData) : null;
    } catch (error) {
      authLogger.error('Failed to get token', error);
      console.error('Failed to get token:', error);
      return null;
    }
  },

  /**
   * 获取用户信息
   */
  async getUserData(): Promise<any | null> {
    try {
      const userData = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA, SECURE_STORE_OPTIONS);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to get user data:', error);
      return null;
    }
  },

  /**
   * 检查是否存在有效的认证数据
   */
  async hasValidToken(): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) return false;

      const now = Math.floor(Date.now() / 1000);
      return token.expiresAt > now || token.refreshExpiresAt > now;
    } catch (error) {
      console.error('Failed to check token validity:', error);
      return false;
    }
  },

  /**
   * 检查访问令牌是否过期
   */
  async isAccessTokenExpired(): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) return true;

      const now = Math.floor(Date.now() / 1000);
      return token.expiresAt <= now;
    } catch (error) {
      console.error('Failed to check access token expiry:', error);
      return true;
    }
  },

  /**
   * 检查刷新令牌是否过期
   */
  async isRefreshTokenExpired(): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) return true;

      const now = Math.floor(Date.now() / 1000);
      return token.refreshExpiresAt <= now;
    } catch (error) {
      console.error('Failed to check refresh token expiry:', error);
      return true;
    }
  },

  /**
   * 存储完整的 token 数据
   */
  async storeToken(token: Token): Promise<void> {
    authLogger.info('Storing token', {
      expiresAt: new Date(token.expiresAt * 1000).toISOString(),
      hasRefreshToken: !!token.refreshToken,
      scope: token.scope,
      tokenType: token.tokenType,
    });
    try {
      await SecureStore.setItemAsync(
        STORAGE_KEYS.TOKEN_DATA,
        JSON.stringify(token),
        SECURE_STORE_OPTIONS,
      );
      authLogger.info('Token stored successfully');
    } catch (error) {
      authLogger.error('Failed to store token', error);
      console.error('Failed to store token:', error);
      throw new Error('Failed to store authentication token');
    }
  },

  /**
   * 存储用户信息
   */
  async storeUserData(userData: any): Promise<void> {
    try {
      await SecureStore.setItemAsync(
        STORAGE_KEYS.USER_DATA,
        JSON.stringify(userData),
        SECURE_STORE_OPTIONS,
      );
    } catch (error) {
      console.error('Failed to store user data:', error);
      throw new Error('Failed to store user data');
    }
  },

  /**
   * 更新访问令牌
   */
  async updateAccessToken(accessToken: string, expiresAt: number): Promise<void> {
    try {
      const currentToken = await this.getToken();
      if (currentToken) {
        const updatedToken: Token = {
          ...currentToken,
          accessToken,
          expiresAt,
        };
        await this.storeToken(updatedToken);
      }
    } catch (error) {
      console.error('Failed to update access token:', error);
      throw new Error('Failed to update access token');
    }
  },
};
