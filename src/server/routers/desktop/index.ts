import { router } from '@/libs/trpc/lambda';

import { pgTableRouter } from './pgTable';

export const desktopRouter = router({
  pgTable: pgTableRouter,
});

export type DesktopRouter = typeof desktopRouter;
