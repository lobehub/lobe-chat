import { ActionIcon, Modal } from '@lobehub/ui';
import { useResponsive } from 'antd-style';
import { Share2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { MOBILE_HEADER_ICON_SIZE } from '@/const/layoutTokens';
import { useSessionStore } from '@/store/session';

const Inner = dynamic(() => import('./Inner'));

const ShareButton = memo(() => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation('common');
  const [shareLoading] = useSessionStore((s) => [s.shareLoading]);
  const { mobile } = useResponsive();

  const size = mobile ? MOBILE_HEADER_ICON_SIZE : { fontSize: 24 };

  return (
    <>
      <ActionIcon
        icon={Share2}
        loading={shareLoading}
        onClick={() => setIsModalOpen(true)}
        size={size}
        title={t('share')}
      />
      <Modal
        centered={false}
        footer={null}
        onCancel={() => setIsModalOpen(false)}
        open={isModalOpen}
        title={t('share')}
      >
        <Inner />
      </Modal>
    </>
  );
});

export default ShareButton;
