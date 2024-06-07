'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { memo, useEffect } from 'react';
import { createStoreUpdater } from 'zustand-utils';

import { LOBE_URL_IMPORT_NAME } from '@/const/url';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useEnabledDataSync } from '@/hooks/useSyncData';
import { useAgentStore } from '@/store/agent';
import { useGlobalStore } from '@/store/global';
import { useServerConfigStore } from '@/store/serverConfig';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/selectors';

const StoreInitialization = memo(() => {
  const router = useRouter();

  const [isLogin, useInitUserState, importUrlShareSettings] = useUserStore((s) => [
    authSelectors.isLogin(s),
    s.useInitUserState,
    s.importUrlShareSettings,
  ]);

  const { serverConfig } = useServerConfigStore();

  const useInitSystemStatus = useGlobalStore((s) => s.useInitSystemStatus);

  const useInitAgentStore = useAgentStore((s) => s.useInitAgentStore);

  // init the system preference
  useInitSystemStatus();

  // init inbox agent and default agent config
  useInitAgentStore(serverConfig.defaultAgent?.config);

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
  const searchParam = useSearchParams().get(LOBE_URL_IMPORT_NAME);
  useEffect(() => {
    importUrlShareSettings(searchParam);
  }, [searchParam]);

  // useEffect(() => {
  //   router.prefetch('/chat');
  //   router.prefetch('/market');
  //
  //   if (mobile) {
  //     router.prefetch('/me');
  //     router.prefetch('/chat/settings');
  //     router.prefetch('/settings/common');
  //     router.prefetch('/settings/agent');
  //     router.prefetch('/settings/sync');
  //   } else {
  //     router.prefetch('/chat/settings/modal');
  //     router.prefetch('/settings/modal');
  //   }
  // }, [router, mobile]);

  return null;
});

export default StoreInitialization;
