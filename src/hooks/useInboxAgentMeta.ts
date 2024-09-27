import { useTranslation } from 'react-i18next';

import { useServerConfigStore } from '@/store/serverConfig';
import { featureFlagsSelectors } from '@/store/serverConfig/selectors';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors, sessionSelectors } from '@/store/session/selectors';

export const useInboxAgentMeta = () => {
  const { t } = useTranslation(['chat', 'custom']);

  const [title, description, avatar, isInbox] = useSessionStore((s) => [
    sessionMetaSelectors.currentAgentTitle(s),
    sessionMetaSelectors.currentAgentDescription(s),
    sessionMetaSelectors.currentAgentAvatar(s),
    sessionSelectors.isInboxSession(s),
  ]);

  const { enableCommercialInbox } = useServerConfigStore(featureFlagsSelectors);

  const displayTitle = isInbox
    ? enableCommercialInbox
      ? t('chat.inbox.title', { ns: 'custom' })
      : t('inbox.title')
    : title;

  const displayDesc = isInbox
    ? enableCommercialInbox
      ? t('chat.inbox.desc', { ns: 'custom' })
      : t('inbox.desc')
    : description;

  return {
    avatar,
    description: displayDesc,
    title: displayTitle,
  };
};
