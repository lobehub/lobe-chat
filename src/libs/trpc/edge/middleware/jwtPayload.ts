import { TRPCError } from '@trpc/server';

import { getXorPayload } from '@/utils/server/xor';

import { edgeTrpc } from '../init';

export const jwtPayloadChecker = edgeTrpc.middleware(async (opts) => {
  const { ctx } = opts;

  if (!ctx.authorizationHeader) throw new TRPCError({ code: 'UNAUTHORIZED' });

  const jwtPayload = getXorPayload(ctx.authorizationHeader);

  return opts.next({ ctx: { jwtPayload } });
});
