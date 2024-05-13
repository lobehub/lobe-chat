import { pwaInstallHandler } from 'pwa-install-handler';
import { useEffect, useState } from 'react';

export const usePWAInstall = () => {
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    pwaInstallHandler.addListener(setCanInstall);
    return () => {
      pwaInstallHandler.removeListener(setCanInstall);
    };
  }, []);

  return {
    canInstall,
    install: pwaInstallHandler.install,
  };
};
