import { router } from '@/libs/trpc';

import { pgTableRouter } from './pgTable';

export const desktopRouter = router({
  pgTable: pgTableRouter,
});

export type DesktopRouter = typeof desktopRouter;
