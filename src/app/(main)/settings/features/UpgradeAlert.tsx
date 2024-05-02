import { Alert } from '@lobehub/ui';
import { Button } from 'antd';
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { MANUAL_UPGRADE_URL } from '@/const/url';
import { useGlobalStore } from '@/store/global';

const UpgradeAlert = memo(() => {
  const [hasNewVersion, latestVersion] = useGlobalStore((s) => [s.hasNewVersion, s.latestVersion]);
  const { t } = useTranslation('common');

  return (
    hasNewVersion && (
      <Alert
        action={
          <Link aria-label={t('upgradeVersion.action')} href={MANUAL_UPGRADE_URL} target={'_blank'}>
            <Button size={'small'} type={'primary'}>
              {t('upgradeVersion.action')}
            </Button>
          </Link>
        }
        closable
        message={t('upgradeVersion.newVersion', { version: latestVersion })}
        showIcon={false}
        style={{ marginBottom: 6 }}
        type={'info'}
      />
    )
  );
});

export default UpgradeAlert;
