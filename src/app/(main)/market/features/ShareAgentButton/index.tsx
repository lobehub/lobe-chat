import { ActionIcon, Icon, Modal } from '@lobehub/ui';
import { Button, Skeleton } from 'antd';
import { useResponsive } from 'antd-style';
import { Upload } from 'lucide-react';
import dynamic from 'next/dynamic';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { MOBILE_HEADER_ICON_SIZE } from '@/const/layoutTokens';

const Inner = dynamic(() => import('./Inner'), {
  loading: () => <Skeleton paragraph={{ rows: 8 }} title={false} />,
});

const ShareAgentButton = memo<{ mobile?: boolean }>(({ mobile }) => {
  const { mobile: resMobile } = useResponsive();
  const { t } = useTranslation('market');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const buttonContent =
    mobile || resMobile ? (
      <ActionIcon
        icon={Upload}
        onClick={() => setIsModalOpen(true)}
        size={MOBILE_HEADER_ICON_SIZE}
        title={t('submitAgent')}
      />
    ) : (
      <Button icon={<Icon icon={Upload} />} onClick={() => setIsModalOpen(true)}>
        {t('submitAgent')}
      </Button>
    );

  return (
    <>
      {buttonContent}
      <Modal
        allowFullscreen
        footer={null}
        onCancel={() => setIsModalOpen(false)}
        open={isModalOpen}
        title={t('submitAgent')}
      >
        <Inner />
      </Modal>
    </>
  );
});

export default ShareAgentButton;
