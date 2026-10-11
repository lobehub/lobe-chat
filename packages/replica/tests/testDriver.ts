import useSWR, { mutate } from 'swr';

import { createSWRDriver } from '../src/zustand/driver';

/** SWR driver for tests: plain `useSWR`, matcher revalidation / forget on the default cache. */
export const testDriver = createSWRDriver({
  mutate: (match, ...rest) => mutate(match, ...rest),
  useSWR,
});
