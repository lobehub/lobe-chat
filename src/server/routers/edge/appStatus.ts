import { publicProcedure, router } from '@/libs/trpc';
import { ChangelogService } from '@/server/services/changelog';

export const appStatusRouter = router({
  getLatestChangelogId: publicProcedure.query(async () => {
    const changelogIndex = await new ChangelogService().getChangelogIndex();
    return changelogIndex[0]?.id;
  }),
});
