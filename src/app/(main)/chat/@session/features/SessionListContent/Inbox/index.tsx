import Link from 'next/link';
import { memo } from 'react';

import { DEFAULT_INBOX_AVATAR } from '@/const/meta';
import { INBOX_SESSION_ID } from '@/const/session';
import { SESSION_CHAT_URL } from '@/const/url';
import { useInboxAgentMeta } from '@/hooks/useInboxAgentMeta';
import { useServerConfigStore } from '@/store/serverConfig';
import { useSessionStore } from '@/store/session';

import ListItem from '../ListItem';
import { useSwitchSession } from '../useSwitchSession';

const Inbox = memo(() => {
  const { title } = useInboxAgentMeta();
  const mobile = useServerConfigStore((s) => s.isMobile);
  const activeId = useSessionStore((s) => s.activeId);
  const switchSession = useSwitchSession();

  return (
    <Link
      aria-label={title}
      href={SESSION_CHAT_URL(INBOX_SESSION_ID, mobile)}
      onClick={(e) => {
        e.preventDefault();
        switchSession(INBOX_SESSION_ID);
      }}
    >
      <ListItem
        active={activeId === INBOX_SESSION_ID}
        avatar={DEFAULT_INBOX_AVATAR}
        title={title}
      />
    </Link>
  );
});

export default Inbox;
