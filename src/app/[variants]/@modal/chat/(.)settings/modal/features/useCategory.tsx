import { Icon } from '@lobehub/ui';
import { Blocks, Bot, BrainCog, MessagesSquare, Mic2, UserCircle } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { MenuProps } from '@/components/Menu';
import { ChatSettingsTabs } from '@/store/global/initialState';

interface UseCategoryOptions {
  mobile?: boolean;
}

export const useCategory = ({ mobile }: UseCategoryOptions = {}) => {
  const { t } = useTranslation('setting');
  const iconSize = mobile ? { fontSize: 20 } : undefined;

  const cateItems: MenuProps['items'] = useMemo(
    () => [
      {
        icon: <Icon icon={UserCircle} size={iconSize} />,
        key: ChatSettingsTabs.Meta,
        label: t('agentTab.meta'),
      },
      {
        icon: <Icon icon={Bot} size={iconSize} />,
        key: ChatSettingsTabs.Prompt,
        label: t('agentTab.prompt'),
      },
      {
        icon: <Icon icon={MessagesSquare} size={iconSize} />,
        key: ChatSettingsTabs.Chat,
        label: t('agentTab.chat'),
      },
      {
        icon: <Icon icon={BrainCog} size={iconSize} />,
        key: ChatSettingsTabs.Modal,
        label: t('agentTab.modal'),
      },
      {
        icon: <Icon icon={Mic2} size={iconSize} />,
        key: ChatSettingsTabs.TTS,
        label: t('agentTab.tts'),
      },
      {
        icon: <Icon icon={Blocks} size={iconSize} />,
        key: ChatSettingsTabs.Plugin,
        label: t('agentTab.plugin'),
      },
    ],
    [t],
  );

  return cateItems;
};
