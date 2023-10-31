import { useResponsive } from 'antd-style';
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { DEFAULT_INBOX_AVATAR } from '@/const/meta';
import { INBOX_SESSION_ID } from '@/const/session';
import { SESSION_CHAT_URL } from '@/const/url';
import { useSessionStore } from '@/store/session';

import ListItem from '../ListItem';

const Inbox = memo(() => {
  const { t } = useTranslation('chat');
  const { mobile } = useResponsive();
  const [activeId, switchSession] = useSessionStore((s) => [s.activeId, s.switchSession]);

  return (
    <Link
      aria-label={t('inbox.title')}
      href={SESSION_CHAT_URL(INBOX_SESSION_ID, mobile)}
      onClick={(e) => {
        e.preventDefault();
        switchSession(INBOX_SESSION_ID);
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
