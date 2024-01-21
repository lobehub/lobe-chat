import { useResponsive } from 'antd-style';
import { useRouter } from 'next/navigation';
import { memo, useEffect } from 'react';
import { createStoreUpdater } from 'zustand-utils';

import { useGlobalStore } from '@/store/global';

const StoreHydration = memo(() => {
  const useFetchGlobalConfig = useGlobalStore((s) => s.useFetchGlobalConfig);
  useFetchGlobalConfig();

  useEffect(() => {
    // refs: https://github.com/pmndrs/zustand/blob/main/docs/integrations/persisting-store-data.md#hashydrated
    useGlobalStore.persist.rehydrate();
  }, []);

  const useStoreUpdater = createStoreUpdater(useGlobalStore);

  const { mobile } = useResponsive();
  useStoreUpdater('isMobile', mobile);

  const router = useRouter();
  useStoreUpdater('router', router);

  useEffect(() => {
    router.prefetch('/chat');
    router.prefetch('/market');
    router.prefetch('/settings/common');
    router.prefetch('/settings/agent');
  }, [router]);

  return null;
});

export default StoreHydration;
