import type { LoaderFunctionArgs } from 'react-router';

import { getActiveWorkspaceSlug } from '@/business/client/hooks/useActiveWorkspaceSlug';
import { PRE_PAINT_HYDRATE_TIMEOUT, settleWithin } from '@/libs/replica/prePaint';
import { getHomeStoreState } from '@/store/home';

// Route loaders run before React commits the route: the only point where the
// persisted "Recent topics" (an async read) can land before the home page paints
// its loading rows. Home always opens on the "mine" view.
export const homeTopicRecentsLoader = async ({ params }: LoaderFunctionArgs): Promise<null> => {
  // A navigation into another workspace (or back to the personal space) runs
  // this loader before the destination commits and switches the scope, so the
  // replica scope still describes the space being left. Seeding it would read
  // the wrong space; the page hydrates on mount once the scope has switched.
  if ((params.workspaceSlug ?? null) !== getActiveWorkspaceSlug()) return null;

  await settleWithin(
    getHomeStoreState().preHydrateHomeTopicRecents('mine'),
    PRE_PAINT_HYDRATE_TIMEOUT,
  );

  return null;
};
