import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const oidcEnv = createEnv({
  client: {},
  runtimeEnv: {
    ENABLE_OIDC: process.env.ENABLE_OIDC === '1',
    OIDC_JWKS_KEY: process.env.OIDC_JWKS_KEY,
  },
  server: {
    // 是否启用 OIDC
    ENABLE_OIDC: z.boolean().optional().default(false),
    // OIDC 签名密钥 (必需)
    // 必须是一个包含私钥的 JWKS (JSON Web Key Set) 格式的 JSON 字符串。
    // 可以使用 `node scripts/generate-oidc-jwk.mjs` 命令生成。
    OIDC_JWKS_KEY: z.string().min(1, 'OIDC_JWKS_KEY is required when OIDC is enabled'),
  },
});

/**
 * 默认 OIDC 客户端配置
 */
export const defaultClients = [
  {
    // 公共客户端，令牌端点无需认证
    application_type: 'native',
    client_id: 'lobehub-desktop',
    client_secret: null,
    description: 'LobeHub Desktop',
    // 仅支持授权码流程
    grant_types: ['authorization_code', 'refresh_token'],
    // 明确指明是原生应用
    isFirstParty: true,

    name: 'LobeHub Desktop',

    // 桌面端注册的自定义协议回调
    post_logout_redirect_uris: ['lobehub-desktop://auth/logout/callback'],

    // 公共客户端，无密钥
    redirect_uris: ['lobehub-desktop://auth/callback','https://oauthdebugger.com/debug'],

    response_types: ['code'],
    // 支持授权码获取令牌和刷新令牌
    token_endpoint_auth_method: 'none', // 标记为第一方客户端
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
