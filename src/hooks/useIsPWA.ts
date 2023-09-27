import { useEffect, useState } from 'react';

export const useIsPWA = () => {
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    const isInStandaloneMode = () => window.matchMedia('(display-mode: standalone)').matches;
    if (isInStandaloneMode()) {
      setIsPWA(true);
    }
  }, []);

  return isPWA;
};
