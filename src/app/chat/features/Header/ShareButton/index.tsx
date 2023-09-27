import { ActionIcon, Modal } from '@lobehub/ui';
import { Share2 } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useSessionStore } from '@/store/session';

import Inner from './Inner';

const ShareButton = memo(() => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation('common');
  const [shareLoading] = useSessionStore((s) => [s.shareLoading]);

  return (
    <>
      <ActionIcon
        icon={Share2}
        loading={shareLoading}
        onClick={() => setIsModalOpen(true)}
        size={{ fontSize: 24 }}
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
