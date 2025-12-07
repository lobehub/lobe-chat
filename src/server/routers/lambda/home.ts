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
});

export type HomeRouter = typeof homeRouter;
