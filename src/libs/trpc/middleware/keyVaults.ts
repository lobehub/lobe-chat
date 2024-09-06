import { TRPCError } from '@trpc/server';

import { getJWTPayload } from '@/app/api/middleware/auth/utils';
import { trpc } from '@/libs/trpc/init';

export const keyVaults = trpc.middleware(async (opts) => {
  const { ctx } = opts;

  if (!ctx.authorizationHeader) throw new TRPCError({ code: 'UNAUTHORIZED' });

  try {
    const jwtPayload = await getJWTPayload(ctx.authorizationHeader);

    return opts.next({ ctx: { jwtPayload } });
  } catch (e) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: (e as Error).message });
  }
});
