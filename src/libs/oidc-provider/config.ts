import { ClientMetadata } from 'oidc-provider';

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

    // 明确指明是原生应用
    isFirstParty: true,

    logo_uri: 'https://hub-apac-1.lobeobjects.space/lobehub-desktop-icon.png',

    // 桌面端注册的自定义协议回调（使用反向域名格式）
    post_logout_redirect_uris: ['com.lobehub.desktop://auth/logout/callback'],

    redirect_uris: ['com.lobehub.desktop://auth/callback', 'https://oauthdebugger.com/debug'],

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
  'openid', // OIDC 必须
  'profile', // 请求用户信息（姓名、头像等）
  'email', // 请求用户邮箱
  'offline_access', // 请求 Refresh Token
  'sync:read', // 自定义 Scope：读取同步数据权限
  'sync:write', // 自定义 Scope：写入同步数据权限
];

/**
 * OIDC Claims 定义 (与 Scopes 关联)
 */
export const defaultClaims = {
  email: ['email', 'email_verified'],
  openid: ['sub'],
  // subject (用户唯一标识)
  profile: ['name', 'picture'],
};
