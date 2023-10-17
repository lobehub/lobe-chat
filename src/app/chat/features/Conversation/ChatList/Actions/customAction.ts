import { ActionIconGroupItems } from '@lobehub/ui/es/ActionIconGroup';
import { LanguagesIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { settingsSelectors, useGlobalStore } from '@/store/global';

export const useCustomActions = () => {
  const { t } = useTranslation('chat');
  const targetLang = useGlobalStore(settingsSelectors.currentLanguage);

  const translate: ActionIconGroupItems = {
    icon: LanguagesIcon,
    key: 'translate',
    label: t('translateTo', { lang: t(`lang.${targetLang}`, { ns: 'common' }) }),
  };

  return {
    translate,
  };
};
