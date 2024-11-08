import { publicProcedure, router } from '@/libs/trpc';

export const toolsRouter = router({
  healthcheck: publicProcedure.query(() => "i'm live!"),
});

export type ToolsRouter = typeof toolsRouter;
