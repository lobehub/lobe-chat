import { ActionIcon, Icon } from '@lobehub/ui';
import { Button } from 'antd';
import { useResponsive } from 'antd-style';
import { Share2 } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { HEADER_ICON_SIZE } from '@/const/layoutTokens';

import SubmitAgentModal from './SubmitAgentModal';

const SubmitAgentButton = memo<{ modal?: boolean }>(({ modal }) => {
  const { t } = useTranslation('setting');
  const { mobile } = useResponsive();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {modal ? (
        <Button block icon={<Icon icon={Share2} />} onClick={() => setIsModalOpen(true)}>
          {t('submitAgentModal.tooltips')}
        </Button>
      ) : (
        <ActionIcon
          icon={Share2}
          onClick={() => setIsModalOpen(true)}
          size={HEADER_ICON_SIZE(mobile)}
          title={t('submitAgentModal.tooltips')}
        />
      )}
      <SubmitAgentModal onCancel={() => setIsModalOpen(false)} open={isModalOpen} />
    </>
  );
});

export default SubmitAgentButton;
