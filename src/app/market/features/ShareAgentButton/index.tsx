import { ActionIcon, Icon, Modal } from '@lobehub/ui';
import { Button } from 'antd';
import { Rss } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { MOBILE_HEADER_ICON_SIZE } from '@/const/layoutTokens';

import Inner from './Inner';

const ShareAgentButton = memo<{ mobile?: boolean }>(({ mobile }) => {
  const { t } = useTranslation('market');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const buttonContent = mobile ? (
    <ActionIcon
      icon={Rss}
      onClick={() => setIsModalOpen(true)}
      size={MOBILE_HEADER_ICON_SIZE}
      title={t('submitAgent')}
    />
  ) : (
    <Button icon={<Icon icon={Rss} />} onClick={() => setIsModalOpen(true)}>
      {t('submitAgent')}
    </Button>
  );

  return (
    <>
      {buttonContent}
      <Modal
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
