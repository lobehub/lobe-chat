import { Icon, Modal } from '@lobehub/ui';
import { Button, Result } from 'antd';
import { createStyles } from 'antd-style';
import { BadgeCheck, CpuIcon } from 'lucide-react';
import { rgba } from 'polished';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import Failed from './Failed';
import MigrationStart from './Start';
import { MigrationError, UpgradeStatus } from './const';

const useStyles = createStyles(({ css, token, prefixCls, isDarkMode }) => ({
  modalTitle: css`
    &.${prefixCls}-modal-header {
      height: 80px;
      background:
        linear-gradient(
          180deg,
          ${rgba(token.colorBgElevated, 0)},
          ${token.colorBgContainer} ${isDarkMode ? '80' : '140'}px
        ),
        fixed 0 0 /10px 10px radial-gradient(${token.colorFill} 1px, transparent 0);
    }

    & .${prefixCls}-modal-title {
      font-size: 24px;
    }
  `,
  title: css`
    font-size: ${token.fontSizeLG}px;
    font-weight: bold;
  `,
}));

interface MigrationModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  state: any;
}

const MigrationModal = memo<MigrationModalProps>(({ setOpen, open, state: dbState }) => {
  const { t } = useTranslation('migration');
  const { styles } = useStyles();
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
            icon={<Icon icon={BadgeCheck} />}
            status={'success'}
            style={{ paddingBlock: 24 }}
            subTitle={t('dbV1.upgrade.success.subTitle')}
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
    <Modal
      centered
      classNames={{
        header: styles.modalTitle,
      }}
      closable={false}
      footer={null}
      open={open}
      title={
        <Flexbox gap={8} horizontal>
          <Icon icon={CpuIcon} />
          {t('dbV1.title')}
        </Flexbox>
      }
      width={550}
    >
      <Center gap={48}>{renderContent()}</Center>
    </Modal>
  );
});

export default MigrationModal;
