import { useUserStore } from '@/mobile/store/user';
import { TokenStorage } from './tokenStorage';
import { authLogger } from '@/mobile/utils/logger';
import { LOBE_CHAT_OIDC_AUTH_HEADER } from '@/mobile/const/auth';

/**
 * 创建带认证的请求头
 */
export const createHeaderWithAuth = async (): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {};

  try {
    authLogger.info('Creating headers with authentication');

    // 获取访问令牌
    const accessToken = await TokenStorage.getAccessToken();
    if (!accessToken) {
      authLogger.error('No access token available');
      return headers;
    }

    authLogger.info('Access token found');

    // 检查令牌是否过期
    const isExpired = await TokenStorage.isAccessTokenExpired();
    authLogger.info('Token expiry check', { isExpired });

    if (isExpired) {
      authLogger.warn('Token expired, attempting refresh');
      try {
        await useUserStore.getState().refreshToken();
        const newAccessToken = await TokenStorage.getAccessToken();
        if (newAccessToken) {
          authLogger.info('Token refreshed successfully');
          headers[LOBE_CHAT_OIDC_AUTH_HEADER] = newAccessToken;
        }
      } catch (refreshError) {
        authLogger.error('Token refresh failed', refreshError);
        console.error('Token refresh failed:', refreshError);
        // 刷新失败，清除认证状态
        await useUserStore.getState().logout();
        throw new Error('Authentication required');
      }
    } else {
      authLogger.info('Token valid, adding authorization header');
      headers[LOBE_CHAT_OIDC_AUTH_HEADER] = accessToken;
    }

    authLogger.info('Headers created successfully with auth');
    return headers;
  } catch (error) {
    authLogger.error('Error creating headers with auth', error);
    console.error('Error creating headers with auth:', error);
    throw error;
  }
};
