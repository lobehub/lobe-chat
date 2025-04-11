import { defaultPolicy } from 'oidc-provider/lib/helpers/defaults';
import { InteractionResults } from 'oidc-provider/lib/helpers/interaction_policy/check';

/**
 * 检查当前会话是否有效
 * @param ctx - 请求上下文
 * @returns 是否已有有效会话
 */
const checkExistingSession = async (ctx: any) => {
  const { oidc, session } = ctx;
  
  // 如果 oidc session 中已有 accountId，说明用户已在本 OIDC 流程中登录过
  if (session?.accountId) {
    return true;
  }
  
  // 检查 Clerk 会话
  const hasClerkSession = await checkClerkSession(ctx.req);
  if (hasClerkSession) {
    const accountId = await getUserIdFromClerk(ctx.req);
    if (accountId) {
      session.accountId = accountId;
      return true;
    }
  }
  
  // 检查 NextAuth 会话
  const hasNextAuthSession = await checkNextAuthSession(ctx.req);
  if (hasNextAuthSession) {
    const accountId = await getUserIdFromNextAuth(ctx.req);
    if (accountId) {
      session.accountId = accountId;
      return true;
    }
  }
  
  return false;
};

/**
 * 检查 Clerk 会话
 * @param req - 请求对象
 * @returns 是否有有效的 Clerk 会话
 */
const checkClerkSession = async (req: any) => {
  try {
    // 在服务端组件中使用 Clerk SDK 验证会话
    // 假设有 Clerk 验证函数在项目中
    const { auth } = await import('@clerk/nextjs/server');
    const { userId } = auth();
    return !!userId;
  } catch (error) {
    console.error('Error checking Clerk session:', error);
    return false;
  }
};

/**
 * 从 Clerk 会话获取用户 ID
 * @param req - 请求对象
 * @returns 用户 ID
 */
const getUserIdFromClerk = async (req: any) => {
  try {
    const { auth } = await import('@clerk/nextjs/server');
    const { userId } = auth();
    return userId;
  } catch (error) {
    console.error('Error getting user ID from Clerk:', error);
    return null;
  }
};

/**
 * 检查 NextAuth 会话
 * @param req - 请求对象
 * @returns 是否有有效的 NextAuth 会话
 */
const checkNextAuthSession = async (req: any) => {
  try {
    // 从 cookie 中提取 NextAuth 会话
    const { getServerSession } = await import('next-auth');
    const authOptions = (await import('@/app/api/auth/[...nextauth]/auth-options')).default;
    const session = await getServerSession(req, null, authOptions);
    return !!session?.user;
  } catch (error) {
    console.error('Error checking NextAuth session:', error);
    return false;
  }
};

/**
 * 从 NextAuth 会话获取用户 ID
 * @param req - 请求对象
 * @returns 用户 ID
 */
const getUserIdFromNextAuth = async (req: any) => {
  try {
    const { getServerSession } = await import('next-auth');
    const authOptions = (await import('@/app/api/auth/[...nextauth]/auth-options')).default;
    const session = await getServerSession(req, null, authOptions);
    return session?.user?.id;
  } catch (error) {
    console.error('Error getting user ID from NextAuth:', error);
    return null;
  }
};

/**
 * 创建自定义交互策略
 */
export const createInteractionPolicy = () => {
  // 从默认策略开始
  const policy = defaultPolicy();
  
  // 添加 'login' 和 'consent' 到必须的 prompt 列表
  policy.get('base').prompts.push('login', 'consent');
  
  // 自定义 'login' 检查逻辑
  policy.get('login').checks.forEach((check) => {
    if (check.name === 'no_session') {
      // 覆盖默认的 no_session 检查，使用我们自定义的会话检查
      check.check = async (ctx) => {
        const existingSession = await checkExistingSession(ctx);
        if (existingSession) {
          return InteractionResults.NO_NEED_TO_PROMPT;
        }
        return InteractionResults.LOGIN_PROMPT;
      };
    }
  });
  
  return policy;
}; 