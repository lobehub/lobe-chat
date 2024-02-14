import { ChatHeader, ChatHeaderTitle } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { SettingsTabs } from '@/store/global/initialState';

const Header = memo(({ activeTab }: { activeTab: SettingsTabs }) => {
  const { t } = useTranslation('setting');

  return (
    <ChatHeader
      left={
        <div style={{ paddingLeft: 8 }}>
          <ChatHeaderTitle title={t(`tab.${activeTab}`)} />
        </div>
      }
    />
  );
});

export default Header;
