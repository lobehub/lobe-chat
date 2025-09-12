import { Tag } from '@lobehub/ui';
import { Lock } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { DEFAULT_INBOX_AVATAR } from '@/const/meta';
import { useChatStore } from '@/store/chat';
import { useChatGroupStore } from '@/store/chatGroup';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/selectors';
import { useUserStore } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';

export interface DMTagProps {
  /**
   * ID of the message sender - can be agent ID or "user"
   */
  senderId?: string;
  /**
   * ID of the message target - can be agent ID or "user"
   */
  targetId?: string;
}

const DMTag = memo<DMTagProps>(({ senderId, targetId }) => {
  const { t } = useTranslation('chat');
  const toggleThread = useChatGroupStore((s) => s.toggleThread);
  const togglePortal = useChatStore((s) => s.togglePortal);

  const currentUserAvatar = useUserStore(userProfileSelectors.userAvatar);

  const targetInfo = useSessionStore((s) => {
    if (!targetId) return null;
    if (targetId === 'user') {
      return {
        avatar: currentUserAvatar || DEFAULT_INBOX_AVATAR,
        backgroundColor: undefined,
        name: t('you'),
      };
    }

    const agentMeta = sessionMetaSelectors.getAgentMetaByAgentId(targetId)(s);
    return {
      avatar: agentMeta.avatar || DEFAULT_INBOX_AVATAR,
      backgroundColor: agentMeta.backgroundColor,
      name: ` ${agentMeta.title || t('untitledAgent')} `,
    };
  });

  // Don't show tag if we don't have target info
  if (!targetInfo) return null;

  // Check if message involves user (either sent by user or sent to user)
  // const involvesUser = senderId === 'user' || targetId === 'user';

  // Handler for opening thread panel
  const handleOpenThread = () => {
    // Open thread with the non-user participant
    const agentId = senderId === 'user' ? targetId : senderId;
    if (agentId && agentId !== 'user') {
      toggleThread(agentId);
      togglePortal(true);
    }
  };

  return (
    <Tag
      color="default"
      icon={<Lock size={12} />}
      onClick={handleOpenThread}
      size="small"
      style={{ cursor: 'pointer' }}
    >
      {t('messages.dm.sentTo', { name: targetInfo.name })}
    </Tag>
  );
});

export default DMTag;
