import { ActionIcon } from '@lobehub/ui';
import { Share2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import useMergeState from 'use-merge-value';

import { DESKTOP_HEADER_ICON_SIZE, MOBILE_HEADER_ICON_SIZE } from '@/const/layoutTokens';
import { useChatStore } from '@/store/chat';

const ShareModal = dynamic(() => import('./ShareModal'));
interface ShareButtonProps {
  mobile?: boolean;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

const ShareButton = memo<ShareButtonProps>(({ mobile, setOpen, open }) => {
  const [isModalOpen, setIsModalOpen] = useMergeState(false, {
    defaultValue: false,
    onChange: setOpen,
    value: open,
  });
  const { t } = useTranslation('common');
  const [shareLoading] = useChatStore((s) => [s.shareLoading]);

  return (
    <>
      <ActionIcon
        icon={Share2}
        loading={shareLoading}
        onClick={() => setIsModalOpen(true)}
        size={mobile ? MOBILE_HEADER_ICON_SIZE : DESKTOP_HEADER_ICON_SIZE}
        title={t('share')}
      />
      <ShareModal onCancel={() => setIsModalOpen(false)} open={isModalOpen} />
    </>
  );
});

export default ShareButton;
