import { useResponsive } from 'antd-style';
import { useRouter } from 'next/navigation';
import { memo, useEffect } from 'react';

import { useGlobalStore } from '@/store/global';
import { usePluginStore } from '@/store/plugin';
import {
  useEffectAfterSessionHydrated,
  useOnFinishHydrationSession,
  useSessionStore,
} from '@/store/session';

const StoreHydration = memo(() => {
  const router = useRouter();

  useEffect(() => {
    // refs: https://github.com/pmndrs/zustand/blob/main/docs/integrations/persisting-store-data.md#hashydrated
    useSessionStore.persist.rehydrate();
    useGlobalStore.persist.rehydrate();
    usePluginStore.persist.rehydrate();
  }, []);

  useOnFinishHydrationSession((s, store) => {
    usePluginStore.getState().checkLocalEnabledPlugins(s.sessions);

    // add router instance to store
    store.setState({ router });
  });

  const { mobile } = useResponsive();

  useEffectAfterSessionHydrated(
    (store) => {
      store.setState({ isMobile: mobile });
    },
    [mobile],
  );

  return null;
});

export default StoreHydration;
