/**
 * This file contains the root router of lobe chat tRPC-backend
 */
import { publicProcedure, router } from '@/libs/trpc';

export const appRouter = router({
  healthcheck: publicProcedure.query(() => "i'm live!"),
});

export type AppRouter = typeof appRouter;
