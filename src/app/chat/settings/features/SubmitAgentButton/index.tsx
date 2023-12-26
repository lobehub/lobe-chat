import { ActionIcon } from '@lobehub/ui';
import { useResponsive } from 'antd-style';
import { Share2 } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { HEADER_ICON_SIZE } from '@/const/layoutTokens';

import SubmitAgentModal from './SubmitAgentModal';

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
      <SubmitAgentModal onCancel={() => setIsModalOpen(false)} open={isModalOpen} />
    </>
  );
});

export default SubmitAgentButton;
