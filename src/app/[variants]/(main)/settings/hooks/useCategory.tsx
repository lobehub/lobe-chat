import { Icon } from '@lobehub/ui';
import {
  Bot,
  Brain,
  Database,
  EthernetPort,
  Image as ImageIcon,
  Info,
  KeyboardIcon,
  Mic2,
  Settings2,
  Sparkles,
} from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { MenuProps } from '@/components/Menu';
import { isDeprecatedEdition, isDesktop } from '@/const/version';
import { SettingsTabs } from '@/store/global/initialState';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

export const useCategory = () => {
  const { t } = useTranslation('setting');
  const mobile = useServerConfigStore((s) => s.isMobile);
  const { showLLM, enableSTT, hideDocs } = useServerConfigStore(featureFlagsSelectors);

  const cateItems: MenuProps['items'] = useMemo(
    () =>
      [
        {
          icon: <Icon icon={Settings2} />,
          key: SettingsTabs.Common,
          label: t('tab.common'),
        },
        {
          icon: <Icon icon={Bot} />,
          key: SettingsTabs.Agent,
          label: t('tab.agent'),
        },
        !mobile && {
          icon: <Icon icon={KeyboardIcon} />,
          key: SettingsTabs.Hotkey,
          label: t('tab.hotkey'),
        },
        {
          type: 'divider',
        },
        showLLM &&
          // TODO: Remove /llm when v2.0
          (isDeprecatedEdition
            ? {
                icon: <Icon icon={Brain} />,
                key: SettingsTabs.LLM,
                label: t('tab.llm'),
              }
            : {
                icon: <Icon icon={Brain} />,
                key: SettingsTabs.Provider,
                label: t('tab.provider'),
              }),
        {
          icon: <Icon icon={ImageIcon} />,
          key: SettingsTabs.Image,
          label: t('tab.image'),
        },
        enableSTT && {
          icon: <Icon icon={Mic2} />,
          key: SettingsTabs.TTS,
          label: t('tab.tts'),
        },
        {
          icon: <Icon icon={Sparkles} />,
          key: SettingsTabs.SystemAgent,
          label: t('tab.system-agent'),
        },
        {
          type: 'divider',
        },
        isDesktop && {
          icon: <Icon icon={EthernetPort} />,
          key: SettingsTabs.Proxy,
          label: t('tab.proxy'),
        },
        {
          icon: <Icon icon={Database} />,
          key: SettingsTabs.Storage,
          label: t('tab.storage'),
        },
        !hideDocs && {
          icon: <Icon icon={Info} />,
          key: SettingsTabs.About,
          label: t('tab.about'),
        },
      ].filter(Boolean) as MenuProps['items'],
    [t, showLLM, enableSTT, hideDocs, mobile],
  );

  return cateItems;
};
