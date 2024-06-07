/**
 * This file contains the root router of lobe chat tRPC-backend
 */
import { publicProcedure, router } from '@/libs/trpc';

import { configRouter } from './edge/config';
import { uploadRouter } from './edge/upload';

export const edgeRouter = router({
  config: configRouter,
  healthcheck: publicProcedure.query(() => "i'm live!"),
  upload: uploadRouter,
});

export type EdgeRouter = typeof edgeRouter;
