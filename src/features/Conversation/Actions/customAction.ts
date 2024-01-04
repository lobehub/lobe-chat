import { ActionIconGroupItems } from '@lobehub/ui/es/ActionIconGroup';
import { LanguagesIcon, Play } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { localeOptions } from '@/locales/resources';

export const useCustomActions = () => {
  const { t } = useTranslation('chat');

  const translate = {
    children: localeOptions.map((i) => ({
      key: i.value,
      label: t(`lang.${i.value}`, { ns: 'common' }),
    })),
    icon: LanguagesIcon,
    key: 'translate',
    label: t('translate.action'),
  } as ActionIconGroupItems;

  const tts = {
    icon: Play,
    key: 'tts',
    label: t('tts.action'),
  } as ActionIconGroupItems;

  return useMemo(() => ({ translate, tts }), []);
};
