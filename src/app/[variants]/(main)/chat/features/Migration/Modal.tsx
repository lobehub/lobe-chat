import { Button, Icon } from '@lobehub/ui';
import { Result } from 'antd';
import { CheckCircle, CpuIcon } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center } from 'react-layout-kit';

import DataStyleModal from '@/components/DataStyleModal';
import { BRANDING_NAME } from '@/const/branding';

import Failed from './Failed';
import MigrationStart from './Start';
import { MigrationError, UpgradeStatus } from './const';

interface MigrationModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  state: any;
}

const MigrationModal = memo<MigrationModalProps>(({ setOpen, open, state: dbState }) => {
  const { t } = useTranslation('migration');
  const [upgradeStatus, setUpgradeStatus] = useState<UpgradeStatus>(UpgradeStatus.START);

  const [error, setError] = useState<MigrationError>();

  const close = () => {
    setOpen(false);
  };

  const renderContent = () => {
    switch (upgradeStatus) {
      case UpgradeStatus.START:
      case UpgradeStatus.UPGRADING: {
        return (
          <MigrationStart
            setError={setError}
            setUpgradeStatus={setUpgradeStatus}
            state={dbState}
            upgradeStatus={upgradeStatus}
          />
        );
      }
      case UpgradeStatus.UPGRADED: {
        return (
          <Result
            extra={
              <Button onClick={close} size={'large'} type={'primary'}>
                {t('dbV1.action.start')}
              </Button>
            }
            icon={<Icon icon={CheckCircle} />}
            status={'success'}
            style={{ paddingBlock: 24 }}
            subTitle={t('dbV1.upgrade.success.subTitle', { appName: BRANDING_NAME })}
            title={t('dbV1.upgrade.success.title')}
          />
        );
      }
      case UpgradeStatus.UPGRADE_FAILED: {
        return (
          <Failed
            error={error}
            setError={setError}
            setUpgradeStatus={setUpgradeStatus}
            state={dbState}
            upgradeStatus={upgradeStatus}
          />
        );
      }
    }
  };

  return (
    <DataStyleModal icon={CpuIcon} open={open} title={t('dbV1.title', { appName: BRANDING_NAME })}>
      <Center gap={48}>{renderContent()}</Center>
    </DataStyleModal>
  );
});

export default MigrationModal;
