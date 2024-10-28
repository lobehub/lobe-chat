'use client';

import dynamic from 'next/dynamic';
import { memo } from 'react';

import { usePlatform } from '@/hooks/usePlatform';
import { useUserStore } from '@/store/user';

const Install: any = dynamic(() => import('./Install'), {
  ssr: false,
});

const PWAInstall = memo(() => {
  const { isPWA } = usePlatform();
  const isShowPWAGuide = useUserStore((s) => s.isShowPWAGuide);

  if (isPWA || !isShowPWAGuide) return null;

  // only when the user is suitable for the pwa install and not install the pwa
  // then show the installation guide
  return <Install />;
});

export default PWAInstall;
