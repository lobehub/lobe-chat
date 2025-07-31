import { TRPCError } from '@trpc/server';

import { getXorPayload } from '@/utils/server/xor';

import { trpc } from '../init';

export const keyVaults = trpc.middleware(async (opts) => {
  const { ctx } = opts;

  if (!ctx.authorizationHeader) throw new TRPCError({ code: 'UNAUTHORIZED' });

  try {
    const jwtPayload = getXorPayload(ctx.authorizationHeader);

    return opts.next({ ctx: { jwtPayload } });
  } catch (e) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: (e as Error).message });
  }
});
