'use client';

import dynamic from 'next/dynamic';
import { memo } from 'react';

import { usePlatform } from '@/hooks/usePlatform';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { useUserStore } from '@/store/user';

const PWAInstallContent = dynamic(import('./Content'), { ssr: false });

const PWAInstall = memo(() => {
  const { isPWA } = usePlatform();

  const isShowPWAGuide = useUserStore((s) => s.isShowPWAGuide);
  const [hidePWAInstaller] = useGlobalStore((s) => [systemStatusSelectors.hidePWAInstaller(s)]);

  console.log(isPWA, hidePWAInstaller, !isShowPWAGuide);
  if (isPWA || hidePWAInstaller || !isShowPWAGuide) return null;

  return <PWAInstallContent />;
});

export default PWAInstall;
