import { publicProcedure, router } from '@/libs/trpc';
import { ChangelogService } from '@/server/services/changelog';

export const appStatusRouter = router({
  getLatestChangelog: publicProcedure.query(async () => {
    return new ChangelogService().getChangelogIndex();
  }),
});
