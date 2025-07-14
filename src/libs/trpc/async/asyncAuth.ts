import { TRPCError } from '@trpc/server';
import debug from 'debug';

import { serverDBEnv } from '@/config/db';
import { UserModel } from '@/database/models/user';
import { LobeChatDatabase } from '@/database/type';

import { asyncTrpc } from './init';

const log = debug('lobe-async:auth');

export const asyncAuth = asyncTrpc.middleware(async (opts) => {
  const { ctx } = opts;

  log('Async auth middleware called for userId: %s', ctx.userId);
  log('Secret validation: %s', ctx.secret === serverDBEnv.KEY_VAULTS_SECRET);

  if (ctx.secret !== serverDBEnv.KEY_VAULTS_SECRET || !ctx.userId) {
    log('Async auth failed - invalid secret or missing userId');
    log('Has secret: %s, Has userId: %s', !!ctx.secret, !!ctx.userId);
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  try {
    log('Looking up user in database: %s', ctx.userId);
    const result = await UserModel.findById(ctx.serverDB as LobeChatDatabase, ctx.userId);

    if (!result) {
      log('User not found in database: %s', ctx.userId);
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'user is invalid' });
    }

    log('User authentication successful: %s', ctx.userId);
    log('Passing jwtPayload keys: %O', Object.keys(ctx.jwtPayload || {}));

    return opts.next({
      ctx: {
        jwtPayload: ctx.jwtPayload,
        userId: ctx.userId,
      },
    });
  } catch (error) {
    log('Database error during user lookup: %O', error);
    throw error;
  }
});
