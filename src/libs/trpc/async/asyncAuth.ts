import { TRPCError } from '@trpc/server';

import { serverDBEnv } from '@/config/db';
import { serverDB } from '@/database/server';
import { UserModel } from '@/database/server/models/user';

import { asyncTrpc } from './init';

export const asyncAuth = asyncTrpc.middleware(async (opts) => {
  const { ctx } = opts;

  if (ctx.secret !== serverDBEnv.KEY_VAULTS_SECRET || !ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  const result = await UserModel.findById(serverDB, ctx.userId);

  if (!result) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'user is invalid' });
  }

  return opts.next({
    ctx: { userId: ctx.userId },
  });
});
