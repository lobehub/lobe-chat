import { getXorPayload } from '@lobechat/utils/server';
import { TRPCError } from '@trpc/server';

import { edgeTrpc } from '../init';

export const jwtPayloadChecker = edgeTrpc.middleware(async (opts) => {
  const { ctx } = opts;

  if (!ctx.authorizationHeader) throw new TRPCError({ code: 'UNAUTHORIZED' });

  const jwtPayload = getXorPayload(ctx.authorizationHeader);

  return opts.next({ ctx: { jwtPayload } });
});
