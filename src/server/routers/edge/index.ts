/**
 * This file contains the edge router of Lobe Chat tRPC-backend
 */
import { publicProcedure, router } from '@/libs/trpc';

import { configRouter } from './config';
import { tokenizerRouter } from './tokenizer';
import { uploadRouter } from './upload';

export const edgeRouter = router({
  config: configRouter,
  healthcheck: publicProcedure.query(() => "i'm live!"),
  tokenizer: tokenizerRouter,
  upload: uploadRouter,
});

export type EdgeRouter = typeof edgeRouter;
