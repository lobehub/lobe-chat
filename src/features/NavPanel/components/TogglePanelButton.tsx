'use client';

import { ActionIcon } from '@lobehub/ui';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { DESKTOP_HEADER_ICON_SIZE } from '@/const/layoutTokens';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';
import { HotkeyEnum } from '@/types/hotkey';

import { useNavPanel } from '../hooks/useNavPanel';

export const TOGGLE_BUTTON_ID = 'toggle_panel_button';

const TogglePanelButton = memo(() => {
  const { togglePanel, expand } = useNavPanel();
  const hotkey = useUserStore(settingsSelectors.getHotkeyById(HotkeyEnum.ToggleLeftPanel));

  const { t } = useTranslation(['chat', 'hotkey']);

  return (
    <ActionIcon
      icon={expand ? PanelLeftClose : PanelLeftOpen}
      id={TOGGLE_BUTTON_ID}
      onClick={togglePanel}
      size={DESKTOP_HEADER_ICON_SIZE}
      title={t('toggleLeftPanel.title', { ns: 'hotkey' })}
      tooltipProps={{
        hotkey,
        placement: 'bottom',
      }}
    />
  );
});

export default TogglePanelButton;
