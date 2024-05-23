import { pwaInstallHandler } from 'pwa-install-handler';
import { useEffect, useState } from 'react';

import { PWA_INSTALL_ID } from '@/const/layoutTokens';
import { isOnServerSide } from '@/utils/env';

import { usePlatform } from './usePlatform';

export const usePWAInstall = () => {
  const [canInstall, setCanInstall] = useState(false);
  const { isSupportInstallPWA, isPWA } = usePlatform();

  useEffect(() => {
    if (isOnServerSide) return;
    pwaInstallHandler.addListener(setCanInstall);
    return () => {
      pwaInstallHandler.removeListener(setCanInstall);
    };
  }, []);

  const installCheck = () => {
    // 当在 PWA 中时，不显示安装按钮
    if (isPWA) return false;
    // 其他情况下，根据是否可以安装来显示安装按钮 (如已经安装则不显示)
    if (isSupportInstallPWA) return canInstall;
    // 当在不支持 PWA 的环境中时，安装按钮 (此时为安装教程)
    return true;
  };

  return {
    canInstall: installCheck(),
    install: () => {
      const pwa: any = document.querySelector(`#${PWA_INSTALL_ID}`);
      if (!pwa) return;
      pwa.externalPromptEvent = pwaInstallHandler.getEvent();
      pwa?.showDialog(true);
    },
  };
};
