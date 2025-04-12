import debug from 'debug';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import Provider, { Configuration, KoaContextWithOIDC } from 'oidc-provider';

import { serverDBEnv } from '@/config/db';
import { UserModel } from '@/database/models/user';
import * as schema from '@/database/schemas';
import { oidcEnv } from '@/envs/oidc';

import { DrizzleAdapter } from './adapter';
import { defaultClaims, defaultClients, defaultScopes } from './config';
import { createInteractionPolicy } from './interaction-policy';

const logProvider = debug('lobe-oidc:provider'); // <--- 添加 provider 日志实例

/**
 * 从环境变量中获取 JWKS
 * 该 JWKS 是一个包含 RS256 私钥的 JSON 对象
 */
const getJWKS = (): object => {
  try {
    const jwksString = oidcEnv.OIDC_JWKS_KEY;

    if (!jwksString) {
      throw new Error(
        'OIDC_JWKS_KEY 环境变量是必需的。请使用 scripts/generate-oidc-jwk.mjs 生成 JWKS。',
      );
    }

    // 尝试解析 JWKS JSON 字符串
    const jwks = JSON.parse(jwksString);

    // 检查 JWKS 格式是否正确
    if (!jwks.keys || !Array.isArray(jwks.keys) || jwks.keys.length === 0) {
      throw new Error('JWKS 格式无效: 缺少或为空的 keys 数组');
    }

    // 检查是否有 RS256 算法的密钥
    const hasRS256Key = jwks.keys.some((key: any) => key.alg === 'RS256' && key.kty === 'RSA');
    if (!hasRS256Key) {
      throw new Error('JWKS 中没有找到 RS256 算法的 RSA 密钥');
    }

    return jwks;
  } catch (error) {
    console.error('解析 JWKS 失败:', error);
    throw new Error(`OIDC_JWKS_KEY 解析错误: ${(error as Error).message}`);
  }
};

/**
 * 获取 Cookie 密钥，使用 KEY_VAULTS_SECRET
 */
const getCookieKeys = () => {
  const key = serverDBEnv.KEY_VAULTS_SECRET;
  if (!key) {
    throw new Error('KEY_VAULTS_SECRET is required for OIDC Provider cookie encryption');
  }
  return [key];
};

/**
 * 创建 OIDC Provider 实例
 * @param db - 数据库实例
 * @param baseUrl - 服务部署的基础URL
 * @returns 配置好的 OIDC Provider 实例
 */
export const createOIDCProvider = async (db: NeonDatabase<typeof schema>, baseUrl: string) => {
  const issuerUrl = `${baseUrl}/oauth`;
  if (!issuerUrl) {
    throw new Error('Base URL is required for OIDC Provider');
  }

  // 获取 JWKS
  const jwks = getJWKS();

  const cookieKeys = getCookieKeys();

  const configuration: Configuration = {
    // 11. 数据库适配器
    adapter: DrizzleAdapter.createAdapterFactory(db),

    // 4. Claims 定义
    claims: defaultClaims,

    // 1. 客户端配置
    clients: defaultClients,

    // 7. Cookie 配置
    cookies: {
      keys: cookieKeys,
      long: { signed: true },
      short: { signed: true },
    },

    // 5. 特性配置
    features: {
      backchannelLogout: { enabled: true },
      clientCredentials: { enabled: false },
      devInteractions: { enabled: false },
      deviceFlow: { enabled: false },
      introspection: { enabled: true },
      resourceIndicators: { enabled: false },
      revocation: { enabled: true },
      rpInitiatedLogout: { enabled: true },
      userinfo: { enabled: true },
    },

    // 10. 账户查找
    async findAccount(ctx: KoaContextWithOIDC, id: string) {
      logProvider('findAccount called for id: %s', id);

      // 检查是否有预先存储的外部账户 ID
      // @ts-ignore - 自定义属性
      const externalAccountId = ctx.externalAccountId;
      if (externalAccountId) {
        logProvider('Found externalAccountId in context: %s', externalAccountId);
      }

      // 确定要查找的账户 ID
      // 优先级: 1. externalAccountId 2. ctx.oidc.session?.accountId 3. 传入的 id
      const accountIdToFind = externalAccountId || ctx.oidc?.session?.accountId || id;

      logProvider(
        'Attempting to find account with ID: %s (source: %s)',
        accountIdToFind,
        externalAccountId
          ? 'externalAccountId'
          : ctx.oidc?.session?.accountId
            ? 'oidc_session'
            : 'parameter_id',
      );

      // 如果没有可用的 ID，返回 undefined
      if (!accountIdToFind) {
        logProvider('findAccount: No account ID available, returning undefined.');
        return undefined;
      }

      try {
        const user = await UserModel.findById(db, accountIdToFind);
        logProvider(
          'UserModel.findById result for %s: %O',
          accountIdToFind,
          user ? { id: user.id, name: user.username } : null,
        );

        if (!user) {
          logProvider('No user found for accountId: %s', accountIdToFind);
          return undefined;
        }

        return {
          accountId: user.id,
          async claims(use, scope): Promise<{ [key: string]: any; sub: string }> {
            logProvider('claims function called for user %s with scope: %s', user.id, scope);
            const claims: { [key: string]: any; sub: string } = {
              sub: user.id,
            };

            if (scope.includes('profile')) {
              claims.name =
                user.fullName ||
                user.username ||
                `${user.firstName || ''} ${user.lastName || ''}`.trim();
              claims.picture = user.avatar;
            }

            if (scope.includes('email')) {
              claims.email = user.email;
              claims.email_verified = !!user.emailVerifiedAt;
            }

            logProvider('Returning claims: %O', claims);
            return claims;
          },
        };
      } catch (error) {
        logProvider('Error finding account or generating claims: %O', error);
        console.error('Error finding account:', error);
        return undefined;
      }
    },
    // 9. 交互策略
    interactions: {
      policy: createInteractionPolicy(),
      url(ctx, interaction) {
        // ---> 添加日志 <---
        logProvider('interactions.url function called');
        logProvider('Interaction details: %O', interaction);
        const interactionUrl = `/oauth/interaction/${interaction.uid}`;
        logProvider('Generated interaction URL: %s', interactionUrl);
        // ---> 添加日志结束 <---
        return interactionUrl;
      },
    },

    // 6. 密钥配置 - 使用 RS256 JWKS
    jwks: jwks as { keys: any[] },

    // 2. PKCE 配置
    pkce: {
      required: () => true,
    },

    // 12. 其他配置
    renderError: async (ctx, out, error) => {
      ctx.type = 'html';
      ctx.body = `
        <html>
          <head>
            <title>LobeChat OIDC Error</title>
          </head>
          <body>
            <h1>LobeChat OIDC Error</h1>
            <p>${error}</p>
            <p>${out}</p>
          </body>
        </html>
      `;
    },

    // 新增：启用 Refresh Token 轮换
    rotateRefreshToken: true,

    // 3. Scopes 定义
    scopes: defaultScopes,

    // 8. 令牌有效期
    ttl: {
      AccessToken: 3600, // 1 hour in seconds
      AuthorizationCode: 600, // 10 minutes
      DeviceCode: 600, // 10 minutes (if enabled)

      IdToken: 3600, // 1 hour
      Interaction: 3600, // 1 hour

      RefreshToken: 30 * 24 * 60 * 60, // 30 days
      Session: 30 * 24 * 60 * 60, // 30 days
    },
  };

  // 创建提供者实例
  const provider = new Provider(issuerUrl, configuration);

  provider.on('server_error', (ctx, err) => {
    logProvider('OIDC Provider Server Error: %O', err); // Use logProvider
    console.error('OIDC Provider Error:', err);
  });

  provider.on('authorization.success', (ctx) => {
    logProvider('Authorization successful for client: %s', ctx.oidc.client?.clientId); // Use logProvider
  });

  return provider;
};
