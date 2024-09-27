import { useTranslation } from 'react-i18next';

import { useServerConfigStore } from '@/store/serverConfig';
import { featureFlagsSelectors } from '@/store/serverConfig/selectors';

export const useInboxAgentMeta = () => {
  const { t } = useTranslation(['chat', 'custom']);

  const { enableCommercialInbox } = useServerConfigStore(featureFlagsSelectors);

  const displayTitle = enableCommercialInbox
    ? t('chat.inbox.title', { ns: 'custom' })
    : t('inbox.title');

  const displayDesc = enableCommercialInbox
    ? t('chat.inbox.desc', { ns: 'custom' })
    : t('inbox.desc');

  return {
    description: displayDesc,
    title: displayTitle,
  };
};
