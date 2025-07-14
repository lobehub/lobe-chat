import { ClientMetadata } from 'oidc-provider';
import urlJoin from 'url-join';

import { appEnv } from '@/envs/app';

/**
 * 默认 OIDC 客户端配置
 */
export const defaultClients: ClientMetadata[] = [
  {
    application_type: 'native',
    client_id: 'lobehub-desktop',
    client_name: 'LobeHub Desktop',
    // 仅支持授权码流程
    grant_types: ['authorization_code', 'refresh_token'],

    logo_uri: 'https://hub-apac-1.lobeobjects.space/lobehub-desktop-icon.png',

    // 桌面端登出回调 - 保持原有自定义协议格式
    post_logout_redirect_uris: [
      'com.lobehub.lobehub-desktop-dev://auth/logout/callback',
      'com.lobehub.lobehub-desktop-nightly://auth/logout/callback',
      'com.lobehub.lobehub-desktop-beta://auth/logout/callback',
      'com.lobehub.lobehub-desktop://auth/logout/callback',
    ],

    // 桌面端授权回调 - 改为 Web 页面路径
    redirect_uris: [
      // 动态构建 Web 页面回调 URL
      urlJoin(appEnv.APP_URL!, '/oauth/callback/desktop'),
      // 为本地开发环境添加 localhost 支持
      'http://localhost:3210/oauth/callback/desktop',
      'https://localhost:3210/oauth/callback/desktop',
    ],

    // 支持授权码获取令牌和刷新令牌
    response_types: ['code'],

    // 标记为公共客户端客户端，无密钥
    token_endpoint_auth_method: 'none',
  },
];

/**
 * OIDC Scopes 定义
 */
export const defaultScopes = [
  'openid',
  'profile',
  'email',
  'offline_access', // 允许获取 refresh_token
];

/**
 * OIDC Claims 定义
 */
export const defaultClaims = {
  email: ['email', 'email_verified'],
  openid: ['sub'],
  // subject (用户唯一标识)
  profile: ['name', 'picture'],
};
