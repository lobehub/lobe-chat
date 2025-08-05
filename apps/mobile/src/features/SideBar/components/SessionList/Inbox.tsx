import { useTranslation } from 'react-i18next';

import { ListItem } from '@/components';
import { DEFAULT_INBOX_AVATAR } from '@/const/meta';
import { INBOX_SESSION_ID } from '@/const/session';
import { useSessionStore } from '@/store/session';
import { useGlobalStore } from '@/store/global';

const Inbox = () => {
  const { t } = useTranslation(['chat']);
  const switchSession = useSessionStore((s) => s.switchSession);
  const setDrawerOpen = useGlobalStore((s) => s.setDrawerOpen);

  const handlePress = () => {
    switchSession(INBOX_SESSION_ID);
    setDrawerOpen(false);
  };

  return (
    <ListItem
      avatar={DEFAULT_INBOX_AVATAR}
      href={`/chat?id=${INBOX_SESSION_ID}`}
      onPress={handlePress}
      title={t('session.title', { ns: 'chat' })}
    />
  );
};

export default Inbox;
