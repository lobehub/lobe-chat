import { TRPCError } from '@trpc/server';

import { enableClerk } from '@/const/auth';
import { DESKTOP_USER_ID } from '@/const/desktop';
import { isDesktop } from '@/const/version';

import { trpc } from '../lambda/init';

export const userAuth = trpc.middleware(async (opts) => {
  const { ctx } = opts;

  // 桌面端模式下，跳过默认鉴权逻辑
  if (isDesktop) {
    return opts.next({
      ctx: { userId: DESKTOP_USER_ID },
    });
  }
  // `ctx.user` is nullable
  if (!ctx.userId) {
    if (enableClerk) {
      console.log('clerk auth:', ctx.clerkAuth);
    } else {
      console.log('next auth:', ctx.nextAuth);
    }
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return opts.next({
    ctx: {
      // ✅ user value is known to be non-null now
      userId: ctx.userId,
    },
  });
});
