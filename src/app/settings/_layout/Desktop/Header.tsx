'use client';

import { ChatHeader, ChatHeaderTitle } from '@lobehub/ui';
import { Tag } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { SettingsTabs } from '@/store/global/initialState';

import { useActiveSettingsKey } from '../../../../hooks/useActiveSettingsKey';

const Header = memo(() => {
  const { t } = useTranslation('setting');

  const activeKey = useActiveSettingsKey();

  return (
    <ChatHeader
      left={
        <div style={{ paddingLeft: 8 }}>
          <ChatHeaderTitle
            title={
              <Flexbox align={'center'} gap={8} horizontal>
                {t(`tab.${activeKey}`)}

                {activeKey === SettingsTabs.Sync && <Tag color={'gold'}>{t('tab.experiment')}</Tag>}
              </Flexbox>
            }
          />
        </div>
      }
    />
  );
});

export default Header;
