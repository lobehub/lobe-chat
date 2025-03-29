import { TRPCError } from '@trpc/server';

import { enableClerk } from '@/const/auth';
import { isDesktop } from '@/const/version';

import { trpc } from '../init';

export const userAuth = trpc.middleware(async (opts) => {
  const { ctx } = opts;
  if (isDesktop) {
    return opts.next({
      ctx: {
        userId: 'desktop_user',
      },
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
