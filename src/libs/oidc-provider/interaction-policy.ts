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
  } else {
    console.warn(
      "Could not find 'login' prompt in the base policy. Custom session check not applied.",
    );
    log('WARNING: login prompt not found in base policy');
  }

  log('Custom interaction policy created successfully');
  return policy;
};
