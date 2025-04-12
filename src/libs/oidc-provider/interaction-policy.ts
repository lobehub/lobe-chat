import debug from 'debug';
import { interactionPolicy } from 'oidc-provider';

import { enableClerk, enableNextAuth } from '@/const/auth';
import { ClerkAuth } from '@/libs/clerk-auth';
import NextAuth from '@/libs/next-auth';

const { base } = interactionPolicy; // Import Check and base
const log = debug('lobe-oidc:interaction-policy');

/**
 * 检查当前会话是否有效 (包括 OIDC, Clerk, NextAuth)
 * !! 此函数现在只检查存在性，不修改或保存 OIDC session !!
 * @param ctx - 请求上下文
 * @returns 包含会话是否存在及用户ID的对象
 */
const checkExistingSession = async (ctx: any): Promise<{ accountId?: string; exists: boolean }> => {
  const { session } = ctx.oidc; // Access session via ctx.oidc

  log('checkExistingSession: Checking session: %O', {
    accountId: session?.accountId,
    cookie: ctx.request?.cookies || 'no cookies',
    hasSession: !!session,
  });

  // 1. 检查 OIDC session
  if (session?.accountId) {
    log('checkExistingSession: OIDC session found:', session.accountId);
    return { accountId: session.accountId, exists: true };
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
        return { accountId: result.userId, exists: true };
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
        return { accountId: res.user.id, exists: true };
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
    promptNames: Array.from(policy.keys()),
    size: policy.length,
  });

  const loginPrompt = policy.get('login');
  log('Accessing login prompt from policy: %O', !!loginPrompt);

  if (loginPrompt) {
    log('Login prompt details: %O', {
      checks: Array.from(loginPrompt.checks.keys()),
      name: loginPrompt.name,
      requestable: loginPrompt.requestable,
    });

    const noSessionCheck = loginPrompt.checks.get('no_session');
    log('Found no_session check: %O', !!noSessionCheck);
    log('Original no_session check details: %O', noSessionCheck);

    if (noSessionCheck) {
      const originalCheck = noSessionCheck.check;

      noSessionCheck.check = async (ctx: any) => {
        log('Custom no_session check called for request: %s %s', ctx.method, ctx.url);

        try {
          // 检查是否存在任何有效会话 (OIDC/Clerk/NextAuth)
          // 仅用于记录 externalAccountId，不改变流程
          const sessionCheckResult = await checkExistingSession(ctx);
          log('Session check result: %O', sessionCheckResult);

          // 将 accountId (如果存在) 存储在 ctx 中，供 findAccount 使用
          if (sessionCheckResult.accountId) {
            ctx.externalAccountId = sessionCheckResult.accountId;
            log('Stored accountId (%s) in ctx.externalAccountId', sessionCheckResult.accountId);
          }

          // 调用原始检查函数，保持 OIDC 原生流程不变
          log('Calling original check function, preserving the original OIDC flow');
          const originalResult = await originalCheck(ctx);
          log('Original check function result: %O', originalResult);

          // 重要变更: 始终返回原始检查的结果，不再覆盖
          log('Returning original check result without overriding');
          return originalResult;
        } catch (error) {
          log('ERROR in custom no_session check: %O', error);
          console.error('Error in custom no_session check:', error);
          // 发生错误时，保持原有的错误处理逻辑
          throw error;
        }
      };
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
