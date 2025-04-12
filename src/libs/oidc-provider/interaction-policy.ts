import debug from 'debug';
import { interactionPolicy } from 'oidc-provider';

import { enableClerk, enableNextAuth } from '@/const/auth';
import { ClerkAuth } from '@/libs/clerk-auth';
import NextAuth from '@/libs/next-auth';

const { Check, base } = interactionPolicy; // Import Check and base
const log = debug('lobe-oidc:interaction-policy');

/**
 * 检查当前会话是否有效 (包括 OIDC, Clerk, NextAuth)
 * !! 此函数现在只检查存在性，不修改或保存 OIDC session !!
 * @param ctx - 请求上下文
 * @returns 包含会话是否存在及用户ID的对象
 */
const checkExistingSession = async (
  ctx: any,
): Promise<{ exists: boolean; accountId?: string }> => {
  const { session } = ctx.oidc; // Access session via ctx.oidc

  log('checkExistingSession: Checking session: %O', {
    hasSession: !!session,
    accountId: session?.accountId,
    cookie: ctx.request?.cookies || 'no cookies',
  });

  // 1. 检查 OIDC session
  if (session?.accountId) {
    log('checkExistingSession: OIDC session found:', session.accountId);
    return { exists: true, accountId: session.accountId };
  }

  // 2. 检查 Clerk 会话
  if (enableClerk) {
    log('checkExistingSession: Clerk enabled, checking Clerk session');
    try {
      const clerkAuth = new ClerkAuth();
      log('checkExistingSession: Created ClerkAuth instance');
      const result = await clerkAuth.getAuth();
      log('checkExistingSession: Clerk getAuth result: %O', result);

      if (result.userId) {
        log('checkExistingSession: Clerk session found:', result.userId);
        // 只返回存在性和 ID，不修改 OIDC session
        return { exists: true, accountId: result.userId };
      }
    } catch (error) {
      log('checkExistingSession: Error checking Clerk session: %O', error);
      console.error('Error checking Clerk session:', error);
    }
  }

  // 3. 检查 NextAuth 会话
  if (enableNextAuth) {
    log('checkExistingSession: NextAuth enabled, checking NextAuth session');
    try {
      const res = await NextAuth.auth();
      log('checkExistingSession: NextAuth.auth result: %O', { userId: res?.user?.id });

      if (res?.user?.id) {
        log('checkExistingSession: NextAuth session found:', res.user.id);
        // 只返回存在性和 ID，不修改 OIDC session
        return { exists: true, accountId: res.user.id };
      }
    } catch (error) {
      log('checkExistingSession: Error checking NextAuth session: %O', error);
      console.error('Error checking NextAuth session:', error);
    }
  }

  log('checkExistingSession: No active session found.');
  return { exists: false };
};

/**
 * 创建自定义交互策略
 */
export const createInteractionPolicy = () => {
  log('Creating custom interaction policy');
  const policy = base();

  log('Base policy details: %O', {
    size: policy.size,
    promptNames: Array.from(policy.keys()),
  });

  const loginPrompt = policy.get('login');
  log('Accessing login prompt from policy: %O', !!loginPrompt);

  if (loginPrompt) {
    log('Login prompt details: %O', {
      name: loginPrompt.name,
      requestable: loginPrompt.requestable,
      checks: Array.from(loginPrompt.checks.keys()),
    });

    const noSessionCheck = loginPrompt.checks.get('no_session');
    log('Found no_session check: %O', !!noSessionCheck);
    log('Original no_session check details: %O', noSessionCheck);

    if (noSessionCheck) {
      log('Overriding default no_session check logic');
      const originalCheck = noSessionCheck.check;
      log('Original check function reference saved');

      noSessionCheck.check = async (ctx: any) => {
        log('Custom no_session check called for request: %s %s', ctx.method, ctx.url);

        try {
          // 检查是否存在任何有效会话 (OIDC/Clerk/NextAuth)
          const sessionCheckResult = await checkExistingSession(ctx);
          log('Session check result: %O', sessionCheckResult);

          if (sessionCheckResult.exists && sessionCheckResult.accountId) {
            // 找到会话 (OIDC 或外部)
            // !! 不修改 ctx.oidc.session !!
            // 将 accountId 存储在自定义的 ctx 属性中
            ctx.externalAccountId = sessionCheckResult.accountId;
            log(
              'Custom no_session: External/OIDC session found. Stored accountId (%s) in ctx.externalAccountId. Returning NO_NEED_TO_PROMPT.',
              sessionCheckResult.accountId,
            );
            // 不需要登录提示
            return Check.NO_NEED_TO_PROMPT;
            
          } else {
            // 未找到任何会话，调用原始检查函数处理 OIDC 默认逻辑
            log('No session found via checkExistingSession, calling original check function.');
            const result = await originalCheck(ctx);
            log('Original check function result (case: no session found): %O', result);
            return result;
          }
        } catch (error) {
          log('ERROR in custom no_session check: %O', error);
          console.error('Error in custom no_session check:', error);
          // Fallback on error
          return Check.REQUEST_PROMPT; 
        }
      };
      log('Custom no_session check function installed');
    } else {
      console.warn(
        "Could not find 'no_session' check in the 'login' prompt. Custom session check not applied.",
      );
      log('WARNING: no_session check not found in login prompt');
    }
  } else {
    console.warn(
      "Could not find 'login' prompt in the base policy. Custom session check not applied.",
    );
    log('WARNING: login prompt not found in base policy');
  }

  log('Custom interaction policy created successfully');
  return policy;
};
