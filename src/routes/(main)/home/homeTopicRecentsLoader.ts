import { PRE_PAINT_HYDRATE_TIMEOUT, settleWithin } from '@/libs/replica/prePaint';
import { getHomeStoreState } from '@/store/home';

// Route loaders run before React commits the route: the only point where the
// persisted "Recent topics" (an async read) can land before the home page paints
// its loading rows. Home always opens on the "mine" view.
export const homeTopicRecentsLoader = async (): Promise<null> => {
  await settleWithin(
    getHomeStoreState().preHydrateHomeTopicRecents('mine'),
    PRE_PAINT_HYDRATE_TIMEOUT,
  );

  return null;
};
