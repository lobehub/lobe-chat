import { Icon } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { Lock } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { DEFAULT_INBOX_AVATAR } from '@/const/meta';
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
  const theme = useTheme();
  const toggleThread = useChatGroupStore((s) => s.toggleThread);

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
      name: agentMeta.title || t('untitledAgent'),
    };
  });

  // Don't show tag if we don't have target info
  if (!targetInfo) return null;

  // Check if message involves user (either sent by user or sent to user)
  const involvesUser = senderId === 'user' || targetId === 'user';

  // Handler for opening thread panel
  const handleOpenThread = () => {
    // Open thread with the non-user participant
    const agentId = senderId === 'user' ? targetId : senderId;
    if (agentId && agentId !== 'user') {
      toggleThread(agentId);
    }
  };

  return (
    <Flexbox
      align="center"
      gap={24}
      horizontal
      onClick={handleOpenThread}
      paddingInline={4}
      style={{ cursor: 'pointer' }}
    >
      <Flexbox align="center" flex={1} gap={6} horizontal>
        <Icon icon={<Lock size={12} />} style={{ color: theme.colorSuccess }} />

        <span
          style={{
            color: theme.colorSuccess,
            fontWeight: 500,
          }}
        >
          Only Visible to {/* {t('messages.dm.sentTo')} */}
          {targetInfo.name}
        </span>
      </Flexbox>

      {/* <Flexbox align="center" gap={6} horizontal>
        <Button
          onClick={handleOpenThread}
          size="small"
          style={{ color: theme.colorSuccess }}
          type="text"
        >
          {involvesUser ? 'Open in Thread' : 'Reveal'}
        </Button>
      </Flexbox> */}
    </Flexbox>
  );
});

export default DMTag;
