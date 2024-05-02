import { Icon } from '@lobehub/ui';
import { Bot, Cloudy, Info, Mic2, Settings2, Webhook } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { MenuProps } from '@/components/Menu';
import { SettingsTabs } from '@/store/global/initialState';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

interface UseCategoryOptions {
  mobile?: boolean;
}

export const useCategory = ({ mobile }: UseCategoryOptions = {}) => {
  const { t } = useTranslation('setting');
  const { enableWebrtc, showLLM } = useServerConfigStore(featureFlagsSelectors);

  const iconSize = mobile ? { fontSize: 20 } : undefined;

  const cateItems: MenuProps['items'] = useMemo(
    () =>
      [
        {
          icon: <Icon icon={Settings2} size={iconSize} />,
          key: SettingsTabs.Common,
          label: t('tab.common'),
        },
        enableWebrtc && {
          icon: <Icon icon={Cloudy} size={iconSize} />,
          key: SettingsTabs.Sync,
          label: t('tab.sync'),
        },
        showLLM && {
          icon: <Icon icon={Webhook} size={iconSize} />,
          key: SettingsTabs.LLM,
          label: t('tab.llm'),
        },
        { icon: <Icon icon={Mic2} size={iconSize} />, key: SettingsTabs.TTS, label: t('tab.tts') },
        {
          icon: <Icon icon={Bot} size={iconSize} />,
          key: SettingsTabs.Agent,
          label: t('tab.agent'),
        },
        {
          icon: <Icon icon={Info} size={iconSize} />,
          key: SettingsTabs.About,
          label: t('tab.about'),
        },
      ].filter(Boolean) as MenuProps['items'],
    [t, enableWebrtc, showLLM],
  );

  return cateItems;
};
