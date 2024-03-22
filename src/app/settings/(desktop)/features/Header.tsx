import { ChatHeader, ChatHeaderTitle } from '@lobehub/ui';
import { Tag } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { SettingsTabs } from '@/store/global/initialState';

const Header = memo(({ activeTab }: { activeTab: SettingsTabs }) => {
  const { t } = useTranslation('setting');

  return (
    <ChatHeader
      left={
        <div style={{ paddingLeft: 8 }}>
          <ChatHeaderTitle
            title={
              <Flexbox align={'center'} gap={8} horizontal>
                {t(`tab.${activeTab}`)}

                {activeTab === SettingsTabs.Sync && <Tag color={'gold'}>{t('tab.experiment')}</Tag>}
              </Flexbox>
            }
          />
        </div>
      }
    />
  );
});

export default Header;
