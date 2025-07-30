import { useTranslation } from 'react-i18next';

import { ListItem } from '@/mobile/components';
import { DEFAULT_INBOX_AVATAR } from '@/mobile/const/meta';
import { INBOX_SESSION_ID } from '@/mobile/const/session';
import { useSessionStore } from '@/mobile/store/session';

const Inbox = () => {
  const { t } = useTranslation(['chat']);
  const switchSession = useSessionStore((s) => s.switchSession);

  const handlePress = () => {
    switchSession(INBOX_SESSION_ID);
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
