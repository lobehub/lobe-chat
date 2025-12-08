import { publicProcedure, router } from '@/libs/trpc/lambda';

import { klavisRouter } from './klavis';
import { mcpRouter } from './mcp';
import { searchRouter } from './search';

export const toolsRouter = router({
  healthcheck: publicProcedure.query(() => "i'm live!"),
  klavis: klavisRouter,
  mcp: mcpRouter,
  search: searchRouter,
});

export type ToolsRouter = typeof toolsRouter;
