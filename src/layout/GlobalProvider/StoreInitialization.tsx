'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { memo, useEffect } from 'react';
import { createStoreUpdater } from 'zustand-utils';

import { LOBE_URL_IMPORT_NAME } from '@/const/url';
import { useImportConfig } from '@/hooks/useImportConfig';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useEnabledDataSync } from '@/hooks/useSyncData';
import { useAgentStore } from '@/store/agent';
import { useGlobalStore } from '@/store/global';
import { useServerConfigStore } from '@/store/serverConfig';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/selectors';

const StoreInitialization = memo(() => {
  const router = useRouter();

  const [useInitUserState, isLogin] = useUserStore((s) => [
    s.useInitUserState,
    authSelectors.isLogin(s),
  ]);

  const { serverConfig } = useServerConfigStore();

  const useInitSystemStatus = useGlobalStore((s) => s.useInitSystemStatus);

  const useFetchDefaultAgentConfig = useAgentStore((s) => s.useFetchDefaultAgentConfig);
  // init the system preference
  useInitSystemStatus();
  useFetchDefaultAgentConfig();

  useInitUserState(isLogin, serverConfig, {
    onSuccess: (state) => {
      if (state.isOnboard === false) {
        router.push('/onboard');
      }
    },
  });

  useEnabledDataSync();

  const useStoreUpdater = createStoreUpdater(useGlobalStore);

  const mobile = useIsMobile();

  useStoreUpdater('isMobile', mobile);
  useStoreUpdater('router', router);

  // Import settings from the url
  const { importSettings } = useImportConfig();
  const searchParam = useSearchParams().get(LOBE_URL_IMPORT_NAME);
  useEffect(() => {
    importSettings(searchParam);
  }, [searchParam]);

  useEffect(() => {
    router.prefetch('/chat');
    router.prefetch('/market');

    if (mobile) {
      router.prefetch('/me');
      router.prefetch('/chat/settings');
      router.prefetch('/settings/common');
      router.prefetch('/settings/agent');
      router.prefetch('/settings/sync');
    } else {
      router.prefetch('/chat/settings/modal');
      router.prefetch('/settings/modal');
    }
  }, [router, mobile]);

  return null;
});

export default StoreInitialization;
