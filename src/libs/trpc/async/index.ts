import { getServerDB } from '@/database/core/db-adaptor';

import { asyncAuth } from './asyncAuth';
import { asyncTrpc } from './init';

export const publicProcedure = asyncTrpc.procedure;

export const asyncRouter = asyncTrpc.router;

export const asyncAuthedProcedure = asyncTrpc.procedure.use(asyncAuth).use(
  asyncTrpc.middleware(async (opts) => {
    const serverDB = await getServerDB();

    return opts.next({
      ctx: { serverDB },
    });
  }),
);

export const createAsyncCallerFactory = asyncTrpc.createCallerFactory;
