import { useTranslation } from 'react-i18next';

import { isCustomBranding } from '@/const/version';

export const useInboxAgentMeta = () => {
  const { t } = useTranslation(['chat', 'custom']);

  const displayTitle = isCustomBranding
    ? t('chat.inbox.title', { ns: 'custom' })
    : t('inbox.title');

  const displayDesc = isCustomBranding ? t('chat.inbox.desc', { ns: 'custom' }) : t('inbox.desc');

  return {
    description: displayDesc,
    title: displayTitle,
  };
};
