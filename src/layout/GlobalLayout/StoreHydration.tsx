import { useResponsive } from 'antd-style';
import { useRouter } from 'next/navigation';
import { memo, useEffect } from 'react';

import { useEffectAfterGlobalHydrated, useGlobalStore } from '@/store/global';

const StoreHydration = memo(() => {
  const [useFetchServerConfig, useFetchUserConfig] = useGlobalStore((s) => [
    s.useFetchServerConfig,
    s.useFetchUserConfig,
  ]);
  const { isLoading } = useFetchServerConfig();

  useFetchUserConfig(!isLoading);

  useEffect(() => {
    // refs: https://github.com/pmndrs/zustand/blob/main/docs/integrations/persisting-store-data.md#hashydrated
    useGlobalStore.persist.rehydrate();
  }, []);

  const { mobile } = useResponsive();
  useEffectAfterGlobalHydrated(
    (store) => {
      const prevState = store.getState().isMobile;

      if (prevState !== mobile) {
        store.setState({ isMobile: mobile });
      }
    },
    [mobile],
  );

  const router = useRouter();

  useEffectAfterGlobalHydrated(
    (store) => {
      store.setState({ router });
    },
    [router],
  );

  useEffect(() => {
    router.prefetch('/chat');
    router.prefetch('/chat/settings');
    router.prefetch('/market');
    router.prefetch('/settings/common');
    router.prefetch('/settings/agent');
  }, [router]);

  return null;
});

export default StoreHydration;
