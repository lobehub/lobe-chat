import { useEffect, useState } from 'react';

export const useIsPWA = () => {
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    const isInStandaloneMode = () =>
      'standalone' in window.navigator && window.navigator['standalone'];
    if (isInStandaloneMode()) {
      setIsPWA(true);
    }
  }, []);

  return isPWA;
};
