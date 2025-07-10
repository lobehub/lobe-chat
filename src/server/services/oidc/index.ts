import { TRPCError } from '@trpc/server';
import debug from 'debug';

import { createContextForInteractionDetails } from '@/libs/oidc-provider/http-adapter';
import { OIDCProvider } from '@/libs/oidc-provider/provider';

import { getOIDCProvider } from './oidcProvider';

const log = debug('lobe-oidc:service');

export class OIDCService {
  private provider: OIDCProvider;

  constructor(provider: OIDCProvider) {
    this.provider = provider;
  }
  static async initialize() {
    const provider = await getOIDCProvider();

    return new OIDCService(provider);
  }

  /**
   * 验证 OIDC Bearer Token 并返回用户信息
   * 使用 oidc-provider 实例的 AccessToken.find 方法验证 token
   *
   * @param token - Bearer Token
   * @returns 包含用户ID和Token数据的对象
   * @throws 如果token无效或OIDC未启用则抛出 TRPCError
   */
  async validateToken(token: string) {
    try {
      log('Validating access token using AccessToken.find');

      // 使用 oidc-provider 的 AccessToken 查找和验证方法
      const accessToken = await this.provider.AccessToken.find(token);

      if (!accessToken) {
        log('Access token not found, expired, or consumed');
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Access token 无效、已过期或已被使用',
        });
      }

      // 从 accessToken 实例中获取必要的数据
      // 注意：accessToken 没有 payload() 方法，而是直接访问其属性
      const userId = accessToken.accountId; // 用户 ID 通常存储在 accountId 属性中
      const clientId = accessToken.clientId;

      // 如果需要更多的声明信息，可以从 accessToken 的其他属性中获取
      // 例如，scopes、claims、exp 等
      const tokenData = {
        client_id: clientId,
        exp: accessToken.exp,
        iat: accessToken.iat,
        jti: accessToken.jti,
        scope: accessToken.scope,
        // OIDC 标准中，sub 字段表示用户 ID
        sub: userId,
      };

      if (!userId) {
        log('Access token does not contain user ID (accountId)');
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Access token 中未包含用户 ID',
        });
      }

      log('Access token validated successfully for user: %s', userId);
      return {
        // 包含 token 原始数据，可用于获取更多信息
        accessToken,
        // 构建的 token 数据对象
        tokenData,
        // 用户 ID
        userId,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;

      // AccessToken.find 可能抛出特定错误
      log('Error validating access token with AccessToken.find: %O', error);
      console.error('OIDC 令牌验证错误:', error);
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: `OIDC 认证失败: ${(error as Error).message}`,
      });
    }
  }

  async getInteractionDetails(uid: string) {
    const { req, res } = await createContextForInteractionDetails(uid);
    return this.provider.interactionDetails(req, res);
  }

  async getInteractionResult(uid: string, result: any) {
    const { req, res } = await createContextForInteractionDetails(uid);
    return this.provider.interactionResult(req, res, result);
  }

  async finishInteraction(uid: string, result: any) {
    const { req, res } = await createContextForInteractionDetails(uid);
    return this.provider.interactionFinished(req, res, result, { mergeWithLastSubmission: true });
  }

  async findOrCreateGrants(accountId: string, clientId: string, existingGrantId?: string) {
    // 2. 查找或创建 Grant 对象
    let grant;
    if (existingGrantId) {
      // 如果之前的交互步骤已经关联了 Grant
      grant = await this.provider.Grant.find(existingGrantId);
      log('Found existing grantId: %s', existingGrantId);
    }

    if (!grant) {
      // 如果没有找到或没有 existingGrantId，则创建新的
      grant = new this.provider.Grant({
        accountId: accountId,
        clientId: clientId,
      });
      log('Created new Grant for account %s and client %s', accountId, clientId);
    }

    return grant;
  }

  async getClientMetadata(clientId: string) {
    const client = await this.provider.Client.find(clientId);
    return client?.metadata();
  }
}

export { getOIDCProvider } from './oidcProvider';
