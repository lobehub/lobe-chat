'use client';

import dynamic from 'next/dynamic';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { PWA_INSTALL_ID } from '@/const/layoutTokens';
import { usePlatform } from '@/hooks/usePlatform';

// @ts-ignore
const PWA: any = dynamic(() => import('@khmyznikov/pwa-install/dist/pwa-install.react.js'), {
  ssr: false,
});

const PWAInstall = memo(() => {
  const { t } = useTranslation('metadata');
  const { isPWA } = usePlatform();
  if (isPWA) return null;
  return <PWA description={t('chat.description')} id={PWA_INSTALL_ID} />;
});

export default PWAInstall;
