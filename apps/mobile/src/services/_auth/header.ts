import { useUserStore } from '@/store/user';
import { TokenStorage } from './tokenStorage';
import { authLogger } from '@/utils/logger';
import { LOBE_CHAT_OIDC_AUTH_HEADER, LOBE_CHAT_AUTH_HEADER } from '@/const/auth';
import { aiProviderSelectors, useAiInfraStore } from '@/store/aiInfra';

import { obfuscatePayloadWithXOR } from '@/utils/client/xor-obfuscation';
import { authExpired } from '@/features/Error/AuthExpired';

/**
 * 认证参数接口，与 Web 端保持一致
 */
interface AuthParams {
  headers?: Record<string, string>;
  payload?: Record<string, any>;
  provider?: string;
}

/**
 * 复制web端的提供商密钥处理逻辑
 */
const getProviderAuthPayload = (provider: string, keyVaults: any) => {
  switch (provider) {
    case 'bedrock': {
      const { accessKeyId, region, secretAccessKey, sessionToken } = keyVaults;
      const awsSecretAccessKey = secretAccessKey;
      const awsAccessKeyId = accessKeyId;
      const apiKey = (awsSecretAccessKey || '') + (awsAccessKeyId || '');

      return {
        accessKeyId,
        accessKeySecret: awsSecretAccessKey,
        apiKey,
        awsAccessKeyId,
        awsRegion: region,
        awsSecretAccessKey,
        awsSessionToken: sessionToken,
        region,
        sessionToken,
      };
    }

    case 'azure': {
      return {
        apiKey: keyVaults.apiKey,
        apiVersion: keyVaults.apiVersion,
        azureApiVersion: keyVaults.apiVersion,
        baseURL: keyVaults.baseURL || keyVaults.endpoint,
      };
    }

    case 'ollama': {
      return { baseURL: keyVaults?.baseURL };
    }

    case 'cloudflare': {
      return {
        apiKey: keyVaults?.apiKey,
        baseURLOrAccountID: keyVaults?.baseURLOrAccountID,
        cloudflareBaseURLOrAccountID: keyVaults?.baseURLOrAccountID,
      };
    }

    default: {
      return { apiKey: keyVaults?.apiKey, baseURL: keyVaults?.baseURL };
    }
  }
};

/**
 * 复制web端的密钥库处理逻辑
 */
const createPayloadWithKeyVaults = (provider: string) => {
  const keyVaults =
    aiProviderSelectors.providerKeyVaults(provider)(useAiInfraStore.getState()) || {};
  return getProviderAuthPayload(provider, keyVaults);
};

/**
 * Mobile端认证token生成逻辑
 * 直接从store读取信息，使用空密码
 */
const createAuthTokenWithPayload = async (payload = {}) => {
  const userState = useUserStore.getState();
  const accessCode = ''; // Mobile端使用空密码
  const userId = userState.user?.id || ''; // 直接读取user.id

  return obfuscatePayloadWithXOR<any>({ accessCode, userId, ...payload });
};

/**
 * 创建带认证的请求头
 *
 * 功能说明：
 * 1. 【保持兼容】始终执行OIDC认证逻辑，获取JWT token
 * 2. 【新增功能】如果提供了provider参数，额外添加AI提供商密钥认证
 * 3. 【双重认证】最终返回包含两种认证方式的headers（如果都成功）
 * 4. 【错误隔离】AI提供商认证失败不影响OIDC认证
 *
 * 返回的headers可能包含：
 * - `Oidc-Auth`: JWT token (OIDC认证)
 * - `X-lobe-chat-auth`: XOR混淆的provider密钥 (AI提供商认证)
 * - 其他自定义headers
 *
 * @param params - 可选的认证参数，与 Web 端接口保持一致
 * @param params.headers - 额外的HTTP头信息
 * @param params.payload - 载荷数据
 * @param params.provider - AI提供商标识，存在时会添加提供商密钥认证
 */
export const createHeaderWithAuth = async (
  params?: AuthParams,
): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {};

  try {
    authLogger.info('Creating headers with authentication');

    const accessToken = await TokenStorage.getAccessToken();

    // 检查令牌是否过期（当 token 缺失时也会返回 true）
    const isExpired = await TokenStorage.isAccessTokenExpired();
    authLogger.info('Token expiry check', { isExpired });

    if (!accessToken || isExpired) {
      authLogger.warn('Access token missing or expired, attempting refresh');
      try {
        await useUserStore.getState().refreshToken();
        const newAccessToken = await TokenStorage.getAccessToken();
        if (newAccessToken) {
          authLogger.info('Token refreshed successfully');
          headers[LOBE_CHAT_OIDC_AUTH_HEADER] = newAccessToken;
        } else {
          authLogger.error('Refreshed but no access token available');
          // 刷新后仍无 token，视为未认证
          throw new Error('Token refresh failed');
        }
      } catch (refreshError) {
        authLogger.error('Token refresh failed', refreshError);
        authExpired.redirect();
      }
    } else {
      authLogger.info('Token valid, adding authorization header');
      headers[LOBE_CHAT_OIDC_AUTH_HEADER] = accessToken;
    }

    authLogger.info('Headers created successfully with auth');

    // 【新增】如果提供了 provider 参数，添加 AI 提供商密钥认证逻辑
    if (params?.provider) {
      try {
        authLogger.info('Provider specified, adding AI provider authentication', {
          provider: params.provider,
        });

        // 构建AI提供商载荷
        let providerPayload = params?.payload || {};
        providerPayload = { ...providerPayload, ...createPayloadWithKeyVaults(params.provider) };

        // 生成AI提供商认证token
        const providerToken = await createAuthTokenWithPayload(providerPayload);

        // 添加AI提供商认证头（使用web端相同的头名称）
        headers[LOBE_CHAT_AUTH_HEADER] = providerToken;

        authLogger.info('AI provider authentication added successfully');
      } catch (providerError) {
        // AI提供商认证失败不影响OIDC认证，只记录警告
        authLogger.warn(
          'AI provider authentication failed, continuing with OIDC only',
          providerError,
        );
      }
    }

    // 合并传入的 headers，认证 headers 优先级更高
    const finalHeaders = { ...params?.headers, ...headers };

    return finalHeaders;
  } catch (error) {
    authLogger.error('Error creating headers with auth', error);
    throw error;
  }
};
