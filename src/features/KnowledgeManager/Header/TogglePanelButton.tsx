'use client';

import { ActionIcon, Tooltip } from '@lobehub/ui';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { DESKTOP_HEADER_ICON_SIZE, FOLDER_WIDTH } from '@/const/layoutTokens';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';
import { HotkeyEnum } from '@/types/hotkey';

export const TOOGLE_PANEL_BUTTON_ID = 'toggle-panel-button';

const TogglePanelButton = memo(() => {
  const hotkey = useUserStore(settingsSelectors.getHotkeyById(HotkeyEnum.ToggleLeftPanel));

  const { t } = useTranslation(['file']);

  const showFilePanel = useGlobalStore(systemStatusSelectors.showFilePanel);
  const updateSystemStatus = useGlobalStore((s) => s.updateSystemStatus);

  return (
    <Tooltip hotkey={hotkey} title={t('toggleLeftPanel')}>
      <ActionIcon
        icon={showFilePanel ? PanelLeftClose : PanelLeftOpen}
        id={TOOGLE_PANEL_BUTTON_ID}
        onClick={() => {
          updateSystemStatus({
            filePanelWidth: showFilePanel ? 0 : FOLDER_WIDTH,
            showFilePanel: !showFilePanel,
          });
        }}
        size={DESKTOP_HEADER_ICON_SIZE}
      />
    </Tooltip>
  );
});

export default TogglePanelButton;
