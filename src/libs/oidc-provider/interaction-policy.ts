import { interactionPolicy } from 'oidc-provider';

import { enableClerk, enableNextAuth } from '@/const/auth';
import { ClerkAuth } from '@/libs/clerk-auth';
import NextAuth from '@/libs/next-auth';

const { Check, base } = interactionPolicy; // Import Check and base

/**
 * 检查当前会话是否有效 (包括 OIDC, Clerk, NextAuth)
 * @param ctx - 请求上下文
 * @returns 是否已有有效会话
 */
const checkExistingSession = async (ctx: any): Promise<boolean> => {
  // Ensure return type is boolean
  const { session } = ctx.oidc; // Access session via ctx.oidc

  console.log('Checking session:', session);

  // 1. 检查 OIDC session
  if (session?.accountId) {
    console.log('OIDC session found:', session.accountId);
    return true;
  }

  // 2. 检查 Clerk 会话
  if (enableClerk) {
    try {
      const clerkAuth = new ClerkAuth();
      const result = await clerkAuth.getAuth();
      if (result.userId) {
        console.log('Clerk session found:', result.userId);
        // 如果找到 Clerk session，将其 accountId 同步到 OIDC session 中
        session.accountId = result.userId;
        await session.save(); // 持久化 OIDC session 的更新
        return true;
      }
    } catch (error) {
      console.error('Error checking Clerk session:', error);
    }
  }

  // 3. 检查 NextAuth 会话
  if (enableNextAuth) {
    try {
      const res = await NextAuth.auth();
      if (res?.user?.id) {
        console.log('NextAuth session found:', res.user.id);
        // 如果找到 NextAuth session，将其 accountId 同步到 OIDC session 中
        session.accountId = res.user.id;
        await session.save(); // 持久化 OIDC session 的更新
        return true;
      }
    } catch (error) {
      console.error('Error checking NextAuth session:', error);
      // NextAuth.auth() 在没有会话时可能会抛出特定错误，这里可以根据需要处理
    }
  }

  console.log('No active session found.');
  return false;
};

/**
 * 创建自定义交互策略
 */
export const createInteractionPolicy = () => {
  // 1. 从默认策略开始
  const policy = base(); // 使用 base() 获取默认策略实例

  // 2. 获取 'login' prompt
  const loginPrompt = policy.get('login');

  if (loginPrompt) {
    // 3. 获取 'login' prompt 中的 'no_session' check
    const noSessionCheck = loginPrompt.checks.get('no_session');

    if (noSessionCheck) {
      // 4. 覆盖默认的 no_session 检查逻辑
      // 原检查逻辑: 如果 ctx.oidc.session.accountId 不存在，则返回 REQUEST_PROMPT
      // 新逻辑: 如果 OIDC/Clerk/NextAuth 会话都不存在，才返回 REQUEST_PROMPT
      noSessionCheck.check = async (ctx: any) => {
        const hasSession = await checkExistingSession(ctx);
        if (hasSession) {
          // 如果任何一种会话存在，则不需要提示登录
          return Check.NO_NEED_TO_PROMPT;
        }
        // 否则，需要提示登录
        return Check.REQUEST_PROMPT;
      };
    } else {
      console.warn(
        "Could not find 'no_session' check in the 'login' prompt. Custom session check not applied.",
      );
    }
  } else {
    console.warn(
      "Could not find 'login' prompt in the base policy. Custom session check not applied.",
    );
  }

  // 不需要手动添加 'login' 和 'consent' prompts，它们默认存在
  // 我们只是修改了 'login' prompt 内部的 'no_session' check

  return policy;
};
