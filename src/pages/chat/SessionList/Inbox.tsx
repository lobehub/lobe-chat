import { Avatar, List } from '@lobehub/ui';
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { DEFAULT_INBOX_AVATAR } from '@/const/meta';
import { INBOX_SESSION_ID } from '@/const/session';
import { useSessionStore } from '@/store/session';

const Inbox = memo(() => {
  const { t } = useTranslation('common');
  const [activeId] = useSessionStore((s) => [s.activeId]);

  return (
    <Link href={'/chat'}>
      <List.Item
        active={activeId === INBOX_SESSION_ID}
        avatar={<Avatar avatar={DEFAULT_INBOX_AVATAR} size={46} style={{ padding: 3 }} />}
        title={t('inbox.title')}
      />
    </Link>
  );
});

export default Inbox;
