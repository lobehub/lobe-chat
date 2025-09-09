import { useEffect, useMemo } from 'react';

import { aiProviderSelectors, useAiInfraStore } from '@/store/aiInfra';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { useImageStore } from '@/store/image';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/selectors';

/**
 * Manages image configuration initialization
 * Uses optimized state checks to reduce unnecessary re-renders
 */
export const useFetchAiImageConfig = () => {
  // Individual state checks for better performance
  const isStatusInit = useGlobalStore(systemStatusSelectors.isStatusInit);
  const isAuthLoaded = useUserStore(authSelectors.isLoaded);
  const isInitAiProviderRuntimeState = useAiInfraStore(
    aiProviderSelectors.isInitAiProviderRuntimeState,
  );

  // Combined readiness check with memoization
  const isReadyForInit = useMemo(
    () => isStatusInit && isAuthLoaded && isInitAiProviderRuntimeState,
    [isStatusInit, isAuthLoaded, isInitAiProviderRuntimeState],
  );

  const isLogin = useUserStore(authSelectors.isLogin);
  const { lastSelectedImageModel, lastSelectedImageProvider } = useGlobalStore((s) => ({
    lastSelectedImageModel: s.status.lastSelectedImageModel,
    lastSelectedImageProvider: s.status.lastSelectedImageProvider,
  }));

  const isInit = useImageStore((s) => s.isInit);
  const initializeImageConfig = useImageStore((s) => s.initializeImageConfig);

  useEffect(() => {
    if (isReadyForInit && !isInit) {
      initializeImageConfig(isLogin, lastSelectedImageModel, lastSelectedImageProvider);
    }
  }, [
    isReadyForInit,
    isInit,
    isLogin,
    lastSelectedImageModel,
    lastSelectedImageProvider,
    initializeImageConfig,
  ]);
};
