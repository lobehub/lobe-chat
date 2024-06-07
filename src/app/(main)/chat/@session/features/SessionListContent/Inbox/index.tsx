import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { DEFAULT_INBOX_AVATAR } from '@/const/meta';
import { INBOX_SESSION_ID } from '@/const/session';
import { SESSION_CHAT_URL } from '@/const/url';
import { useQueryRoute } from '@/hooks/useQueryRoute';
import { useServerConfigStore } from '@/store/serverConfig';
import { useSessionStore } from '@/store/session';

import ListItem from '../ListItem';

const Inbox = memo(() => {
  const { t } = useTranslation('chat');
  const mobile = useServerConfigStore((s) => s.isMobile);
  const [activeId, activeSession] = useSessionStore((s) => [s.activeId, s.activeSession]);
  const router = useQueryRoute();

  return (
    <Link
      aria-label={t('inbox.title')}
      href={SESSION_CHAT_URL(INBOX_SESSION_ID, mobile)}
      onClick={(e) => {
        e.preventDefault();
        activeSession(INBOX_SESSION_ID);

        if (mobile) {
          setTimeout(() => {
            router.replace('/chat', {
              query: { session: INBOX_SESSION_ID, showMobileWorkspace: 'true' },
            });
          }, 50);
        }
      }}
    >
      <ListItem
        active={activeId === INBOX_SESSION_ID}
        avatar={DEFAULT_INBOX_AVATAR}
        title={t('inbox.title')}
      />
    </Link>
  );
});

export default Inbox;
