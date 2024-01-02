import { useEffect, useState } from 'react';

import { isInStandaloneMode } from '@/utils/matchMedia';

export const useIsPWA = () => {
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    setIsPWA(isInStandaloneMode());
  }, []);

  return isPWA;
};
