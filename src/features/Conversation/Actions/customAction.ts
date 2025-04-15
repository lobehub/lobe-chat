import type { ActionIconGroupItemType } from '@lobehub/ui';
import { css, cx } from 'antd-style';
import { LanguagesIcon, Play } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { localeOptions } from '@/locales/resources';

const translateStyle = css`
  .ant-dropdown-menu-sub {
    overflow-y: scroll;
    max-height: 400px;
  }
`;

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
    popupClassName: cx(translateStyle),
  } as ActionIconGroupItemType;

  const tts = {
    icon: Play,
    key: 'tts',
    label: t('tts.action'),
  } as ActionIconGroupItemType;

  return useMemo(() => ({ translate, tts }), []);
};
