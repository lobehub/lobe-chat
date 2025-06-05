import { getUserAuth } from '@/utils/server/auth';

export interface AuthContext {
  isAuthenticated: boolean;
  session?: any;
  userId: string | null;
}

export const UserExtractor = {
  /**
   * 从请求头中提取认证信息（用于API路由）
   * 检查是否有OAuth授权头
   */
  extractFromHeaders(req: Request): AuthContext {
    const oauthAuthorized = req.headers.get('X-oauth-authorized');

    if (oauthAuthorized === 'true') {
      // 如果有OAuth授权头，说明middleware已经验证过了
      // 但我们仍需要获取具体的userId
      return {
        // 需要进一步获取
        isAuthenticated: true,
        session: null,
        userId: null,
      };
    }

    return {
      isAuthenticated: false,
      userId: null,
    };
  },

  /**
   * 从请求中提取用户认证信息
   * 利用现有的认证基础设施
   */
  async extractFromRequest(): Promise<AuthContext> {
    try {
      // 使用现有的 getUserAuth 函数
      const authResult = await getUserAuth();

      if (authResult.userId) {
        return {
          isAuthenticated: true,
          session:
            'nextAuth' in authResult
              ? authResult.nextAuth
              : 'clerkAuth' in authResult
                ? authResult.clerkAuth
                : null,
          userId: authResult.userId,
        };
      }

      return {
        isAuthenticated: false,
        userId: null,
      };
    } catch (error) {
      console.error('Failed to extract user from request:', error);
      return {
        isAuthenticated: false,
        userId: null,
      };
    }
  },

  /**
   * 从NextAuth session中提取用户ID
   * 适用于已经有session的场景
   */
  extractFromSession(session: any): AuthContext {
    if (session?.user?.id) {
      return {
        isAuthenticated: true,
        session,
        userId: session.user.id,
      };
    }

    return {
      isAuthenticated: false,
      userId: null,
    };
  },
};
