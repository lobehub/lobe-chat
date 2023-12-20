import { useResponsive } from 'antd-style';
import { useRouter } from 'next/navigation';
import { memo, useEffect } from 'react';

import { useGlobalStore } from '@/store/global';
import { useEffectAfterSessionHydrated, useSessionStore } from '@/store/session';

const StoreHydration = memo(() => {
  const router = useRouter();

  useEffect(() => {
    // refs: https://github.com/pmndrs/zustand/blob/main/docs/integrations/persisting-store-data.md#hashydrated
    useSessionStore.persist.rehydrate();
    useGlobalStore.persist.rehydrate();
  }, []);

  const { mobile } = useResponsive();

  useEffectAfterSessionHydrated(
    (store) => {
      store.setState({ isMobile: mobile });
    },
    [mobile],
  );

  useEffectAfterSessionHydrated(
    (store) => {
      store.setState({ router });
    },
    [router],
  );

  return null;
});

export default StoreHydration;
