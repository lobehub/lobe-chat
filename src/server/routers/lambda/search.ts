import { z } from 'zod';

import { SearchRepo } from '@/database/repositories/search';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';

const searchProcedure = authedProcedure.use(serverDatabase).use(async (opts) => {
  const { ctx } = opts;

  return opts.next({
    ctx: { searchRepo: new SearchRepo(ctx.serverDB, ctx.userId) },
  });
});

export const searchRouter = router({
  query: searchProcedure
    .input(
      z.object({
        limitPerType: z.number().optional(),
        offset: z.number().optional(),
        query: z.string(),
        type: z.enum(['agent', 'topic', 'file']).optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      return ctx.searchRepo.search(input);
    }),
});
