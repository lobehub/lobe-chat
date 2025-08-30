'use client';

import { ActionIcon } from '@lobehub/ui';
import {
  PanelLeftRightDashedIcon,
  PanelRightClose,
  PanelRightOpen,
  SquareChartGanttIcon,
} from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { DESKTOP_HEADER_ICON_SIZE } from '@/const/layoutTokens';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';
import { HotkeyEnum } from '@/types/hotkey';

import SettingButton from '../../../features/SettingButton';
import ShareButton from '../../../features/ShareButton';

const HeaderAction = memo<{ className?: string }>(({ className }) => {
  const { t } = useTranslation('chat');
  const hotkey = useUserStore(settingsSelectors.getHotkeyById(HotkeyEnum.ToggleRightPanel));
  const [showAgentSettings, wideScreen, toggleConfig, toggleWideScreen] = useGlobalStore((s) => [
    systemStatusSelectors.showChatSideBar(s),
    systemStatusSelectors.wideScreen(s),
    s.toggleChatSideBar,
    s.toggleWideScreen,
  ]);

  const { isAgentEditable } = useServerConfigStore(featureFlagsSelectors);

  return (
    <Flexbox className={className} gap={4} horizontal>
      <ActionIcon
        icon={wideScreen ? SquareChartGanttIcon : PanelLeftRightDashedIcon}
        onClick={() => toggleWideScreen()}
        size={DESKTOP_HEADER_ICON_SIZE}
        title={t(wideScreen ? 'toggleWideScreen.off' : 'toggleWideScreen.on')}
        tooltipProps={{
          placement: 'bottom',
        }}
      />
      <ShareButton />
      <ActionIcon
        icon={showAgentSettings ? PanelRightClose : PanelRightOpen}
        onClick={() => toggleConfig()}
        size={DESKTOP_HEADER_ICON_SIZE}
        title={t('toggleRightPanel.title', { ns: 'hotkey' })}
        tooltipProps={{
          hotkey,
          placement: 'bottom',
        }}
      />
      {isAgentEditable && <SettingButton />}
    </Flexbox>
  );
});

export default HeaderAction;
