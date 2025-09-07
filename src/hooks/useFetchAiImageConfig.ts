import { useEffect } from 'react';

import { aiProviderSelectors, useAiInfraStore } from '@/store/aiInfra';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { useImageStore } from '@/store/image';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/selectors';

export const useFetchAiImageConfig = () => {
  const isLoaded = useUserStore(authSelectors.isLoaded);
  const isStatusInit = useGlobalStore(systemStatusSelectors.isStatusInit);
  const isInitAiProviderRuntimeState = useAiInfraStore(
    aiProviderSelectors.isInitAiProviderRuntimeState,
  );
  const isInit = useImageStore((s) => s.isInit);
  const initializeImageConfig = useImageStore((s) => s.initializeImageConfig);

  useEffect(() => {
    if (isStatusInit && isInitAiProviderRuntimeState && isLoaded && !isInit) {
      initializeImageConfig();
    }
  }, [isStatusInit, isInitAiProviderRuntimeState, isLoaded, isInit, initializeImageConfig]);
};
