import { publicProcedure, router } from '@/libs/trpc';

import { searchRouter } from './search';

export const toolsRouter = router({
  healthcheck: publicProcedure.query(() => "i'm live!"),
  search: searchRouter,
});

export type ToolsRouter = typeof toolsRouter;
