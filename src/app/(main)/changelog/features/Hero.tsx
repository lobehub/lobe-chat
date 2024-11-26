'use client';

import { useTheme } from 'antd-style';
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import urlJoin from 'url-join';

import { BRANDING_NAME } from '@/const/branding';
import { OFFICIAL_SITE, X } from '@/const/url';

import GridLayout from './GridLayout';

const Hero = memo(() => {
  const { t } = useTranslation('changelog');
  const theme = useTheme();
  return (
    <GridLayout>
      <Flexbox gap={16} style={{ paddingTop: 32, zIndex: 1 }}>
        <h1 style={{ fontSize: 40, fontWeight: 'bold', margin: 0 }}>{t('title')}</h1>
        <div style={{ fontSize: 24, opacity: 0.6 }}>
          {t('description', { appName: BRANDING_NAME })}
        </div>
        <Flexbox gap={8} horizontal style={{ fontSize: 16 }}>
          <Link href={urlJoin(OFFICIAL_SITE, '/changelog/versions')} target={'_blank'}>
            {t('actions.versions')}
          </Link>
          <div style={{ color: theme.colorInfo }}>·</div>
          <Link href={X} target={'_blank'}>
            {t('actions.followOnX')}
          </Link>
        </Flexbox>
      </Flexbox>
    </GridLayout>
  );
});

export default Hero;
