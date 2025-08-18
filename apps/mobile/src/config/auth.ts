import { OFFICIAL_URL } from '@/const/url';
import { AuthConfig } from '@/_types/user';
import { isDev } from '@/utils/env';

/**
 * 认证配置
 */
export const authConfig: AuthConfig = {
  additionalParameters: {
    // 额外的参数可以在这里添加
    // 比如：prompt: 'consent' 可以强制用户每次都同意授权
    prompt: 'consent',
  },
  clientId: process.env.EXPO_PUBLIC_OAUTH_CLIENT_ID || 'lobehub-mobile',
  issuer: process.env.EXPO_PUBLIC_OAUTH_ISSUER || OFFICIAL_URL,
  redirectUri: process.env.EXPO_PUBLIC_OAUTH_REDIRECT_URI || 'com.lobehub.app://auth/callback',
  scopes: ['openid', 'profile', 'email', 'offline_access'],
};
/**
 * 开发环境配置
 */
export const devAuthConfig: AuthConfig = {
  ...authConfig,
  // 开发环境的认证服务器
  additionalParameters: {
    ...authConfig.additionalParameters,
    // 开发环境可以添加额外的参数
  },
  issuer: 'http://localhost:3020',
};

/**
 * 获取当前环境的认证配置
 */
export const getAuthConfig = (): AuthConfig => {
  return isDev ? devAuthConfig : authConfig;
};

/**
 * 认证端点路径
 */
export const AUTH_ENDPOINTS = {
  AUTH: '/oidc/auth',
  TOKEN: '/oidc/token',
} as const;

/**
 * 认证相关的常量
 */
export const AUTH_CONSTANTS = {
  // 30分钟
  // 最大重试次数
  MAX_RETRY_COUNT: 3,

  // 5分钟
  // 自动刷新间隔（毫秒）
  REFRESH_INTERVAL: 30 * 60 * 1000,

  // 令牌刷新阈值（秒）
  REFRESH_THRESHOLD: 5 * 60,
  // 请求超时时间（毫秒）
  REQUEST_TIMEOUT: 10_000, // 10秒
} as const;

/**
 * 认证错误代码
 */
export const AUTH_ERROR_CODES = {
  // 访问被拒绝
  ACCESS_DENIED: 'access_denied',

  // 无效的客户端
  INVALID_CLIENT: 'invalid_client',

  // 无效的授权码
  INVALID_GRANT: 'invalid_grant',

  // 无效的刷新令牌
  INVALID_REFRESH_TOKEN: 'invalid_refresh_token',

  // 网络错误
  NETWORK_ERROR: 'network_error',

  // 令牌过期
  TOKEN_EXPIRED: 'token_expired',

  // 未知错误
  UNKNOWN_ERROR: 'unknown_error',

  // 用户取消授权
  USER_CANCELLED: 'user_cancelled',
} as const;

/**
 * 认证状态
 */
export const AUTH_STATUS = {
  // 已认证
  AUTHENTICATED: 'authenticated',

  // 认证中
  AUTHENTICATING: 'authenticating',

  // 错误
  ERROR: 'error',

  // 登出中
  LOGGING_OUT: 'logging_out',

  // 刷新中
  REFRESHING: 'refreshing',

  // 未认证
  UNAUTHENTICATED: 'unauthenticated',
} as const;

export type AuthStatus = (typeof AUTH_STATUS)[keyof typeof AUTH_STATUS];
export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES];
