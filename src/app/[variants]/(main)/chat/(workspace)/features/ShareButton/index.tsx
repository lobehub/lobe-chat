'use client';

import { ActionIcon } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { Share2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { DESKTOP_HEADER_ICON_SIZE, MOBILE_HEADER_ICON_SIZE } from '@/const/layoutTokens';
import { useWorkspaceModal } from '@/hooks/useWorkspaceModal';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

const ShareModal = dynamic(() => import('@/features/ShareModal'));

interface ShareButtonProps {
  mobile?: boolean;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

const ShareButton = memo<ShareButtonProps>(({ mobile, setOpen, open }) => {
  const [isModalOpen, setIsModalOpen] = useWorkspaceModal(open, setOpen);
  const { t } = useTranslation('common');
  const [shareLoading] = useChatStore((s) => [s.shareLoading]);

  const [systemRole] = useAgentStore((s) => [agentSelectors.currentAgentSystemRole(s)]);
  const messages = useChatStore(chatSelectors.activeBaseChats, isEqual);
  const mainDisplayChatIDs = useChatStore(chatSelectors.mainDisplayChatIDs, isEqual);

  return (
    <>
      <ActionIcon
        icon={Share2}
        loading={shareLoading}
        onClick={() => setIsModalOpen(true)}
        size={mobile ? MOBILE_HEADER_ICON_SIZE : DESKTOP_HEADER_ICON_SIZE}
        title={t('share')}
      />
      <ShareModal
        displayMessageIds={mainDisplayChatIDs}
        messages={messages}
        onCancel={() => setIsModalOpen(false)}
        open={isModalOpen}
        systemRole={systemRole}
      />
    </>
  );
});

export default ShareButton;
