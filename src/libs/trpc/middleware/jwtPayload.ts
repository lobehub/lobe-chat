import { TRPCError } from '@trpc/server';

import { getJWTPayload } from '@/app/(backend)/middleware/auth/utils';
import { trpc } from '@/libs/trpc/init';

export const jwtPayloadChecker = trpc.middleware(async (opts) => {
  const { ctx } = opts;

  if (!ctx.authorizationHeader) throw new TRPCError({ code: 'UNAUTHORIZED' });

  const jwtPayload = await getJWTPayload(ctx.authorizationHeader);

  return opts.next({ ctx: { jwtPayload } });
});
