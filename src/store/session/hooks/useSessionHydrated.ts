import { useState } from 'react';

import { sessionSelectors } from '../selectors';
import { useSessionStore } from '../store';
import { useEffectAfterSessionHydrated } from './useEffectAfterHydrated';

export const useSessionHydrated = () => {
  const hasInited = sessionSelectors.hasConversion(useSessionStore.getState());

  const [isInit, setInit] = useState(hasInited);

  useEffectAfterSessionHydrated(() => {
    if (!isInit) setInit(true);
  }, []);

  return isInit;
};
