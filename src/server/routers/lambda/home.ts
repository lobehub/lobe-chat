import { z } from 'zod';

import { HomeRepository } from '@/database/repositories/home';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';

const homeProcedure = authedProcedure.use(serverDatabase).use(async (opts) => {
  const { ctx } = opts;

  return opts.next({
    ctx: {
      homeRepository: new HomeRepository(ctx.serverDB, ctx.userId),
    },
  });
});

export const homeRouter = router({
  getSidebarAgentList: homeProcedure.query(async ({ ctx }) => {
    return ctx.homeRepository.getSidebarAgentList();
  }),

  searchAgents: homeProcedure
    .input(z.object({ keyword: z.string() }))
    .query(async ({ input, ctx }) => {
      return ctx.homeRepository.searchAgents(input.keyword);
    }),
});

export type HomeRouter = typeof homeRouter;
