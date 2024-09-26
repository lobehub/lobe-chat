import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { clientFeatureFlags } from '@/config/featureFlags';
import { DEFAULT_INBOX_AVATAR } from '@/const/meta';
import { INBOX_SESSION_ID } from '@/const/session';
import { SESSION_CHAT_URL } from '@/const/url';
import { useServerConfigStore } from '@/store/serverConfig';
import { useSessionStore } from '@/store/session';

import ListItem from '../ListItem';
import { useSwitchSession } from '../useSwitchSession';

const Inbox = memo(() => {
  const { t } = useTranslation('chat');
  const { t: chatCustom } = useTranslation('custom');
  const mobile = useServerConfigStore((s) => s.isMobile);
  const activeId = useSessionStore((s) => s.activeId);
  const switchSession = useSwitchSession();
  const enableCommercialInbox = clientFeatureFlags().enableCommercialInbox;
  return (
    <Link
      aria-label={enableCommercialInbox ? chatCustom('chat.inbox.title') : t('inbox.title')}
      href={SESSION_CHAT_URL(INBOX_SESSION_ID, mobile)}
      onClick={(e) => {
        e.preventDefault();
        switchSession(INBOX_SESSION_ID);
      }}
    >
      <ListItem
        active={activeId === INBOX_SESSION_ID}
        avatar={DEFAULT_INBOX_AVATAR}
        title={enableCommercialInbox ? chatCustom('chat.inbox.title') : t('inbox.title')}
      />
    </Link>
  );
});

export default Inbox;
