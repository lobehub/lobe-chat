import { useEffect } from 'react';

import { aiProviderSelectors, useAiInfraStore } from '@/store/aiInfra';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { useImageStore } from '@/store/image';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/selectors';

export const useFetchAiImageConfig = () => {
  const isStatusInit = useGlobalStore(systemStatusSelectors.isStatusInit);
  const isInitAiProviderRuntimeState = useAiInfraStore(
    aiProviderSelectors.isInitAiProviderRuntimeState,
  );

  const isAuthLoaded = useUserStore(authSelectors.isLoaded);
  const isLogin = useUserStore(authSelectors.isLogin);
  const isActualLogout = isAuthLoaded && isLogin === false;

  const isUserStateInit = useUserStore((s) => s.isUserStateInit);
  const isUserStateReady = isUserStateInit || isActualLogout;

  const isReadyForInit = isStatusInit && isInitAiProviderRuntimeState && isUserStateReady;

  const { lastSelectedImageModel, lastSelectedImageProvider } = useGlobalStore((s) => ({
    lastSelectedImageModel: s.status.lastSelectedImageModel,
    lastSelectedImageProvider: s.status.lastSelectedImageProvider,
  }));
  const isInitializedImageConfig = useImageStore((s) => s.isInit);
  const initializeImageConfig = useImageStore((s) => s.initializeImageConfig);

  useEffect(() => {
    if (!isInitializedImageConfig && isReadyForInit) {
      initializeImageConfig(isLogin, lastSelectedImageModel, lastSelectedImageProvider);
    }
  }, [
    isReadyForInit,
    isInitializedImageConfig,
    isLogin,
    lastSelectedImageModel,
    lastSelectedImageProvider,
    initializeImageConfig,
  ]);
};
