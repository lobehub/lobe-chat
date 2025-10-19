/**
 * @deprecated
 * TODO: it will be remove in V2.0
 */
import { publicProcedure, router } from '@/libs/trpc/edge';

import { uploadRouter } from './upload';

export const edgeRouter = router({
  healthcheck: publicProcedure.query(() => "i'm live!"),
  upload: uploadRouter,
});

export type EdgeRouter = typeof edgeRouter;
