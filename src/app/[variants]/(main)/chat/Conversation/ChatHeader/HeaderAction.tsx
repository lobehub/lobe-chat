'use client';

import { ActionIcon } from '@lobehub/ui';
import { PanelLeftRightDashedIcon, SquareChartGanttIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import SettingButton from '@/app/[variants]/(main)/chat/Settings/features/SettingButton';
import { DESKTOP_HEADER_ICON_SIZE } from '@/const/layoutTokens';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

import ShareButton from './ShareButton';

const HeaderAction = memo<{ className?: string }>(({ className }) => {
  const { t } = useTranslation('chat');

  const [wideScreen, toggleWideScreen] = useGlobalStore((s) => [
    systemStatusSelectors.wideScreen(s),
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

      {isAgentEditable && <SettingButton />}
    </Flexbox>
  );
});

export default HeaderAction;
