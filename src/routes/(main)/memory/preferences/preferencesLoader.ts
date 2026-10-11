import { PRE_PAINT_HYDRATE_TIMEOUT, settleWithin } from '@/libs/replica/prePaint';
import { useUserMemoryStore } from '@/store/userMemory';

// Route loaders run before React commits the route: the only point where the
// persisted preference list (an async read) can land before the page paints its
// loading skeleton.
export const preferenceListLoader = async (): Promise<null> => {
  await settleWithin(useUserMemoryStore.getState().preHydrate(), PRE_PAINT_HYDRATE_TIMEOUT);

  return null;
};
