'use client';

import { Alert } from '@lobehub/ui';
import { Button } from 'antd';
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { MANUAL_UPGRADE_URL } from '@/const/url';
import { useGlobalStore } from '@/store/global';

const UpgradeAlert = memo(() => {
  const [hasNewVersion, latestVersion] = useGlobalStore((s) => [s.hasNewVersion, s.latestVersion]);
  const { t } = useTranslation('common');

  if (!hasNewVersion) return;

  return (
    <Alert
      closable
      message={
        <Flexbox gap={8}>
          <p>{t('upgradeVersion.newVersion', { version: `v${latestVersion}` })}</p>
          <Link
            aria-label={t('upgradeVersion.action')}
            href={MANUAL_UPGRADE_URL}
            style={{ marginBottom: 6 }}
            target={'_blank'}
          >
            <Button block size={'small'} type={'primary'}>
              {t('upgradeVersion.action')}
            </Button>
          </Link>
        </Flexbox>
      }
      type={'info'}
    />
  );
});

export default UpgradeAlert;
