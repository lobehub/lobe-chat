/**
 * This file contains the root router of lobe chat tRPC-backend
 */
import { publicProcedure, router } from '@/libs/trpc';

import { configRouter } from './config';

export const appRouter = router({
  config: configRouter,
  healthcheck: publicProcedure.query(() => "i'm live!"),
});

export type AppRouter = typeof appRouter;
