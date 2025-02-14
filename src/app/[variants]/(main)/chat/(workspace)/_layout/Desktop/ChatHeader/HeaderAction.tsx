'use client';

import { ActionIcon } from '@lobehub/ui';
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { DESKTOP_HEADER_ICON_SIZE } from '@/const/layoutTokens';
import { useDirection } from '@/hooks/useDirection';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

import SettingButton from '../../../features/SettingButton';
import ShareButton from '../../../features/ShareButton';

const HeaderAction = memo(() => {
  const { t } = useTranslation('chat');
  const direction = useDirection();

  const [showAgentSettings, toggleConfig] = useGlobalStore((s) => [
    systemStatusSelectors.showChatSideBar(s),
    s.toggleChatSideBar,
  ]);

  const { isAgentEditable } = useServerConfigStore(featureFlagsSelectors);

  return (
    <>
      <ShareButton />
      <ActionIcon
        icon={
          showAgentSettings
            ? direction === 'rtl'
              ? PanelLeftClose
              : PanelRightClose
            : direction === 'rtl'
              ? PanelLeftOpen
              : PanelRightOpen
        }
        onClick={() => toggleConfig()}
        size={DESKTOP_HEADER_ICON_SIZE}
        title={t('roleAndArchive')}
      />
      {isAgentEditable && <SettingButton />}
    </>
  );
});

export default HeaderAction;
