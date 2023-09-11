import { Avatar, List } from '@lobehub/ui';
import { useHover } from 'ahooks';
import Link from 'next/link';
import { memo, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { DEFAULT_INBOX_AVATAR } from '@/const/meta';
import { INBOX_SESSION_ID } from '@/const/session';
import { SESSION_CHAT_URL } from '@/const/url';
import { useSessionStore } from '@/store/session';

const { Item } = List;

const Inbox = memo(() => {
  const ref = useRef(null);
  const isHovering = useHover(ref);
  const { t } = useTranslation('common');

  const [mobile, activeId, switchSession] = useSessionStore((s) => [
    s.isMobile,
    s.activeId,
    s.switchSession,
  ]);

  const avatarRender = useMemo(
    () => (
      <Avatar
        animation={isHovering}
        avatar={DEFAULT_INBOX_AVATAR}
        size={46}
        style={{ padding: 3 }}
      />
    ),
    [isHovering],
  );

  return (
    <Link
      href={SESSION_CHAT_URL(INBOX_SESSION_ID, mobile)}
      onClick={(e) => {
        e.preventDefault();
        switchSession(INBOX_SESSION_ID);
      }}
    >
      <Item
        active={activeId === INBOX_SESSION_ID}
        avatar={avatarRender}
        ref={ref}
        style={{ alignItems: 'center' }}
        title={t('inbox.title')}
      />
    </Link>
  );
});

export default Inbox;
