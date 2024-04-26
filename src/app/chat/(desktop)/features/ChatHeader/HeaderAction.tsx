import { ActionIcon } from '@lobehub/ui';
import { PanelRightClose, PanelRightOpen } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { DESKTOP_HEADER_ICON_SIZE } from '@/const/layoutTokens';
import { featureFlagsSelectors, useFeatureFlagStore } from '@/store/featureFlags';
import { useGlobalStore } from '@/store/global';

import SettingButton from '../../../features/SettingButton';
import ShareButton from '../../../features/ShareButton';

const HeaderAction = memo(() => {
  const { t } = useTranslation('chat');

  const [showAgentSettings, toggleConfig] = useGlobalStore((s) => [
    s.preference.showChatSideBar,
    s.toggleChatSideBar,
  ]);

  const { isAgentEditable } = useFeatureFlagStore(featureFlagsSelectors);

  return (
    <>
      <ShareButton />
      <ActionIcon
        icon={showAgentSettings ? PanelRightClose : PanelRightOpen}
        onClick={() => toggleConfig()}
        size={DESKTOP_HEADER_ICON_SIZE}
        title={t('roleAndArchive')}
      />
      {isAgentEditable && <SettingButton />}
    </>
  );
});

export default HeaderAction;
