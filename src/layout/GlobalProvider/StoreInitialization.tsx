'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { createStoreUpdater } from 'zustand-utils';

import { LOBE_URL_IMPORT_NAME } from '@/const/url';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useEnabledDataSync } from '@/hooks/useSyncData';
import { useAgentStore } from '@/store/agent';
import { useGlobalStore } from '@/store/global';
import { useServerConfigStore } from '@/store/serverConfig';
import { serverConfigSelectors } from '@/store/serverConfig/selectors';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/selectors';

const StoreInitialization = memo(() => {
  // prefetch error ns to avoid don't show error content correctly
  useTranslation('error');

  const router = useRouter();
  const [isLogin, isSignedIn, useInitUserState, importUrlShareSettings] = useUserStore((s) => [
    authSelectors.isLogin(s),
    s.isSignedIn,
    s.useInitUserState,
    s.importUrlShareSettings,
  ]);

  const { serverConfig } = useServerConfigStore();

  const useInitSystemStatus = useGlobalStore((s) => s.useInitSystemStatus);

  const useInitAgentStore = useAgentStore((s) => s.useInitAgentStore);

  // init the system preference
  useInitSystemStatus();

  // Update NextAuth status
  const useUserStoreUpdater = createStoreUpdater(useUserStore);
  const enableNextAuth = useServerConfigStore(serverConfigSelectors.enabledOAuthSSO);
  useUserStoreUpdater('enabledNextAuth', enableNextAuth);

  /**
   * The store function of `isLogin` will both consider the values of `enableAuth` and `isSignedIn`.
   * But during initialization, the value of `enableAuth` might be incorrect cause of the async fetch.
   * So we need to use `isSignedIn` only to determine whether request for the default agent config and user state.
   */
  const isLoginOnInit = enableNextAuth ? isSignedIn : isLogin;

  // init inbox agent and default agent config
  useInitAgentStore(isLoginOnInit, serverConfig.defaultAgent?.config);

  // init user state
  useInitUserState(isLoginOnInit, serverConfig, {
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

  useEffect(() => {
    if (mobile) {
      router.prefetch('/me');
    } else {
      router.prefetch('/chat/settings/modal');
      router.prefetch('/settings/modal');
    }
  }, [router, mobile]);

  return null;
});

export default StoreInitialization;
