import { MobileNavBar, MobileNavBarTitle } from '@lobehub/ui';
import { Tag } from 'antd';
import { useRouter } from 'next/navigation';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useActiveSettingsKey } from '@/hooks/useActiveSettingsKey';
import { SettingsTabs } from '@/store/global/initialState';
import { mobileHeaderSticky } from '@/styles/mobileHeader';

const Header = memo(() => {
  const { t } = useTranslation('setting');

  const router = useRouter();
  const activeSettingsKey = useActiveSettingsKey();
  return (
    <MobileNavBar
      center={
        <MobileNavBarTitle
          title={
            <Flexbox align={'center'} gap={4} horizontal>
              {t(`tab.${activeSettingsKey}`)}
              {activeSettingsKey === SettingsTabs.Sync && (
                <Tag color={'gold'}>{t('tab.experiment')}</Tag>
              )}
            </Flexbox>
          }
        />
      }
      onBackClick={() => router.push('/settings')}
      showBackButton
      style={mobileHeaderSticky}
    />
  );
});

export default Header;
