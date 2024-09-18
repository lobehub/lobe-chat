import { publicProcedure, asyncRouter as router } from '@/libs/trpc/async';

import { fileRouter } from './file';
import { ragEvalRouter } from './ragEval';

export const asyncRouter = router({
  file: fileRouter,
  healthcheck: publicProcedure.query(() => "i'm live!"),
  ragEval: ragEvalRouter,
});

export type AsyncRouter = typeof asyncRouter;

export * from './caller';
