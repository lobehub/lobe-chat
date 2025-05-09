/**
 * This file contains the edge router of Lobe Chat tRPC-backend
 */
import { publicProcedure, router } from '@/libs/trpc/edge';

import { appStatusRouter } from './appStatus';
import { configRouter } from './config';
import { marketRouter } from './market';
import { uploadRouter } from './upload';

export const edgeRouter = router({
  appStatus: appStatusRouter,
  config: configRouter,
  healthcheck: publicProcedure.query(() => "i'm live!"),
  market: marketRouter,
  upload: uploadRouter,
});

export type EdgeRouter = typeof edgeRouter;
