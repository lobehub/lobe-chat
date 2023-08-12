import { Avatar, List } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { DEFAULT_INBOX_AVATAR } from '@/const/meta';
import { INBOX_SESSION_ID } from '@/const/session';
import { useSessionStore } from '@/store/session';

const Inbox = memo(() => {
  const { t } = useTranslation('common');
  const [activeId, switchInbox] = useSessionStore((s) => [s.activeId, s.switchInbox]);

  return (
    <List.Item
      active={activeId === INBOX_SESSION_ID}
      avatar={<Avatar avatar={DEFAULT_INBOX_AVATAR} size={46} style={{ padding: 3 }} />}
      onClick={switchInbox}
      title={t('inbox.title')}
    />
  );
});

export default Inbox;
