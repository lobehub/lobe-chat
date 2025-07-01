import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { DEFAULT_INBOX_AVATAR } from '@/const/meta';
import { INBOX_SESSION_ID } from '@/const/session';
import { SESSION_CHAT_URL } from '@/const/url';
import { useSwitchSession } from '@/hooks/useSwitchSession';
import { useChatStore } from '@/store/chat';
import { messageMapKey } from '@/store/chat/utils/messageMapKey';
import { useServerConfigStore } from '@/store/serverConfig';
import { useSessionStore } from '@/store/session';

import ListItem from '../ListItem';

const Inbox = memo(() => {
  const { t } = useTranslation('chat');
  const mobile = useServerConfigStore((s) => s.isMobile);
  const activeId = useSessionStore((s) => s.activeId);
  const switchSession = useSwitchSession();

  const activeTopicId = useChatStore((s) => s.activeTopicId);
  const inboxMessages = useChatStore(
    (s) => s.messagesMap[messageMapKey(INBOX_SESSION_ID, activeTopicId)] || [],
  );
  const openNewTopicOrSaveTopic = useChatStore((s) => s.openNewTopicOrSaveTopic);

  return (
    <Link
      aria-label={t('inbox.title')}
      href={SESSION_CHAT_URL(INBOX_SESSION_ID, mobile)}
      onClick={async (e) => {
        e.preventDefault();
        if (activeId === INBOX_SESSION_ID && inboxMessages.length > 0) {
          // If user tap the inbox again, open a new topic
          await openNewTopicOrSaveTopic();
        } else {
          switchSession(INBOX_SESSION_ID);
        }
      }}
    >
      <ListItem
        active={activeId === INBOX_SESSION_ID}
        avatar={DEFAULT_INBOX_AVATAR}
        key={INBOX_SESSION_ID}
        styles={{
          container: {
            gap: 12,
          },
          content: {
            gap: 6,
            maskImage: `linear-gradient(90deg, #000 90%, transparent)`,
          },
        }}
        title={t('inbox.title')}
      />
    </Link>
  );
});

export default Inbox;
