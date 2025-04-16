import { User } from 'next-auth';
import { NextRequest } from 'next/server';

import { JWTPayload, LOBE_CHAT_AUTH_HEADER, enableClerk, enableNextAuth } from '@/const/auth';
import { oidcEnv } from '@/envs/oidc';
import { ClerkAuth, IClerkAuth } from '@/libs/clerk-auth';
import { extractBearerToken } from '@/utils/server/auth';

export interface OIDCAuth {
  // 其他可能需要的OIDC信息 (可选，因为 payload 包含了所有信息)
  [key: string]: any;
  // OIDC令牌数据 (现在是完整的 payload)
  payload: any;
  // 用户ID
  sub: string;
}

export interface AuthContext {
  authorizationHeader?: string | null;
  clerkAuth?: IClerkAuth;
  jwtPayload?: JWTPayload | null;
  nextAuth?: User;
  // 新增 OIDC 认证信息
  oidcAuth?: OIDCAuth | null;
  oidcPayload?: any; // 这个字段可以考虑移除，oidcAuth.payload 包含了信息
  userId?: string | null;
}

/**
 * Inner function for `createContext` where we create the context.
 * This is useful for testing when we don't want to mock Next.js' request/response
 */
export const createContextInner = async (params?: {
  authorizationHeader?: string | null;
  clerkAuth?: IClerkAuth;
  nextAuth?: User;
  oidcAuth?: OIDCAuth | null;
  userId?: string | null;
}): Promise<AuthContext> => ({
  authorizationHeader: params?.authorizationHeader,
  clerkAuth: params?.clerkAuth,
  nextAuth: params?.nextAuth,
  oidcAuth: params?.oidcAuth,
  userId: params?.userId,
});

export type LambdaContext = Awaited<ReturnType<typeof createContextInner>>;

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/v11/context
 */
export const createLambdaContext = async (request: NextRequest): Promise<LambdaContext> => {
  // for API-response caching see https://trpc.io/docs/v11/caching

  const authorization = request.headers.get(LOBE_CHAT_AUTH_HEADER);
  const standardAuthorization = request.headers.get('Authorization');

  let userId;
  let auth;
  let oidcAuth = null;

  // 优先检查标准的 Authorization 头进行 OIDC Bearer Token 验证
  if (oidcEnv.ENABLE_OIDC) {
    try {
      // 使用 utils 中的 extractBearerToken
      const bearerToken = extractBearerToken(standardAuthorization);

      console.log('bear token', standardAuthorization);
      if (bearerToken) {
        const { OIDCService } = await import('@/server/services/oidc');

        // 初始化 OIDC 服务
        const oidcService = await OIDCService.initialize();
        // 使用 OIDCService 进行验证
        const tokenInfo = await oidcService.validateToken(bearerToken);
        oidcAuth = {
          payload: tokenInfo.tokenData,
          ...tokenInfo.tokenData, // 将 payload 展开放入 oidcAuth
          sub: tokenInfo.userId, // 使用 tokenData 作为 payload
        };
        userId = tokenInfo.userId;

        // 如果通过 OIDC 认证成功，直接返回上下文
        return createContextInner({
          // 保留原始的 LobeChat Authorization Header (如果有)
          authorizationHeader: authorization,
          oidcAuth,
          userId,
        });
      }
    } catch (error) {
      // 如果 OIDC 认证失败，记录错误并继续尝试其他认证方式
      if (standardAuthorization?.startsWith('Bearer ')) {
        console.error('OIDC 认证失败，尝试其他认证方式:', error);
      }
    }
  }

  // 如果 OIDC 未启用或验证失败，尝试 LobeChat 自定义 Header 和其他认证方式
  if (enableClerk) {
    const clerkAuth = new ClerkAuth();
    const result = clerkAuth.getAuthFromRequest(request);
    auth = result.clerkAuth;
    userId = result.userId;

    return createContextInner({ authorizationHeader: authorization, clerkAuth: auth, userId });
  }

  if (enableNextAuth) {
    try {
      const { default: NextAuthEdge } = await import('@/libs/next-auth/edge');

      const session = await NextAuthEdge.auth();
      if (session && session?.user?.id) {
        auth = session.user;
        userId = session.user.id;
      }
      return createContextInner({ authorizationHeader: authorization, nextAuth: auth, userId });
    } catch (e) {
      console.error('next auth err', e);
    }
  }

  // 最终返回，可能 userId 为空
  return createContextInner({ authorizationHeader: authorization, userId });
};
