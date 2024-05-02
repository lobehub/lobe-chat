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
import { useUserStore } from '@/store/user';

const StoreInitialization = memo(() => {
  const [useFetchServerConfig, useFetchUserConfig, useInitPreference] = useUserStore((s) => [
    s.useFetchServerConfig,
    s.useFetchUserConfig,
    s.useInitPreference,
  ]);
  const useInitGlobalPreference = useGlobalStore((s) => s.useInitGlobalPreference);

  const useFetchDefaultAgentConfig = useAgentStore((s) => s.useFetchDefaultAgentConfig);
  // init the system preference
  useInitPreference();
  useInitGlobalPreference();

  useFetchDefaultAgentConfig();

  const { isLoading } = useFetchServerConfig();
  useFetchUserConfig(!isLoading);

  useEnabledDataSync();

  const useStoreUpdater = createStoreUpdater(useGlobalStore);

  const mobile = useIsMobile();
  const router = useRouter();

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
    router.prefetch('/chat/settings');
    router.prefetch('/market');
    router.prefetch('/settings/common');
    router.prefetch('/settings/agent');
    router.prefetch('/settings/sync');
  }, [router]);

  return null;
});

export default StoreInitialization;
