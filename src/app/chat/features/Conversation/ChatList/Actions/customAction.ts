import { ActionIconGroupItems } from '@lobehub/ui/es/ActionIconGroup';
import { LanguagesIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { localeOptions } from '@/locales/options';

export const useCustomActions = () => {
  const { t } = useTranslation('chat');

  const translate = {
    children: localeOptions.map((i) => ({
      key: i.value,
      label: t(`lang.${i.value}`, { ns: 'common' }),
    })),
    icon: LanguagesIcon,
    key: 'translate',
    label: t('translateTo'),
  } as ActionIconGroupItems;

  return {
    translate,
  };
};
