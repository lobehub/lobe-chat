'use client';

import { ActionIcon, Tooltip } from '@lobehub/ui';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useIsSingleMode } from '@/hooks/useIsSingleMode';
import { useGlobalStore } from '@/store/global';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';
import { HotkeyEnum } from '@/types/hotkey';

const TogglePanelButton = memo<{ expand?: boolean }>(({ expand }) => {
  const isSingleMode = useIsSingleMode();
  const hotkey = useUserStore(settingsSelectors.getHotkeyById(HotkeyEnum.ToggleLeftPanel));

  const { t } = useTranslation(['chat', 'hotkey']);

  const updateSystemStatus = useGlobalStore((s) => s.updateSystemStatus);

  const handleTogglePanel = useCallback(() => {
    updateSystemStatus({
      showSessionPanel: !expand,
    });
  }, [expand, updateSystemStatus]);

  if (isSingleMode) {
    return null;
  }

  return (
    <Tooltip
      hotkey={hotkey}
      placement={expand ? 'top' : 'right'}
      title={t('toggleLeftPanel.title', { ns: 'hotkey' })}
    >
      <ActionIcon
        icon={expand ? PanelLeftClose : PanelLeftOpen}
        onClick={handleTogglePanel}
        size={16}
      />
    </Tooltip>
  );
});

export default TogglePanelButton;
