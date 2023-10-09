import { ChatHeader, ChatHeaderTitle } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useGlobalStore } from '@/store/global';

const Header = memo(() => {
  const { t } = useTranslation('setting');
  const tab = useGlobalStore((s) => s.settingsTab);

  return (
    <ChatHeader
      left={
        <div style={{ paddingLeft: 8 }}>
          <ChatHeaderTitle title={t(`tab.${tab}`)} />
        </div>
      }
    />
  );
});

export default Header;
