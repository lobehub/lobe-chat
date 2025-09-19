'use client';

import { ActionIcon, Tooltip } from '@lobehub/ui';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { DESKTOP_HEADER_ICON_SIZE } from '@/const/layoutTokens';
import { useIsSingleMode } from '@/hooks/useIsSingleMode';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';
import { HotkeyEnum } from '@/types/hotkey';

export const TOOGLE_PANEL_BUTTON_ID = 'toggle-panel-button';

const TogglePanelButton = memo(() => {
  const isSingleMode = useIsSingleMode();
  const hotkey = useUserStore(settingsSelectors.getHotkeyById(HotkeyEnum.ToggleLeftPanel));

  const { t } = useTranslation(['chat', 'hotkey']);

  const showSessionPanel = useGlobalStore(systemStatusSelectors.showSessionPanel);
  const updateSystemStatus = useGlobalStore((s) => s.updateSystemStatus);

  if (isSingleMode) {
    return null
  }

  return (
    <Tooltip hotkey={hotkey} title={t('toggleLeftPanel.title', { ns: 'hotkey' })}>
      <ActionIcon
        icon={showSessionPanel ? PanelLeftClose : PanelLeftOpen}
        id={TOOGLE_PANEL_BUTTON_ID}
        onClick={() => {
          updateSystemStatus({
            sessionsWidth: showSessionPanel ? 0 : 320,
            showSessionPanel: !showSessionPanel,
          });
        }}
        size={DESKTOP_HEADER_ICON_SIZE}
      />
    </Tooltip>
  );
});

export default TogglePanelButton;
