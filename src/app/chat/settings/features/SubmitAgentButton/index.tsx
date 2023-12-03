import { ActionIcon, Modal } from '@lobehub/ui';
import { useResponsive } from 'antd-style';
import { Share2 } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { HEADER_ICON_SIZE } from '@/const/layoutTokens';

import Inner from './Inner';

const SubmitAgentButton = memo(() => {
  const { t } = useTranslation('setting');
  const { mobile } = useResponsive();
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <>
      <ActionIcon
        icon={Share2}
        onClick={() => setIsModalOpen(true)}
        size={HEADER_ICON_SIZE(mobile)}
        title={t('submitAgentModal.tooltips')}
      />
      <Modal
        footer={null}
        onCancel={() => setIsModalOpen(false)}
        open={isModalOpen}
        title={t('submitAgentModal.tooltips')}
      >
        <Inner />
      </Modal>
    </>
  );
});

export default SubmitAgentButton;
