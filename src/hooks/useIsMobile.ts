import { useMemo } from 'react';

import { useServerConfigStore } from '@/store/serverConfig';

export const useIsMobile = (): boolean => {
  const mobile = useServerConfigStore((s) => s.isMobile);

  return useMemo(() => !!mobile, [mobile]);
};
