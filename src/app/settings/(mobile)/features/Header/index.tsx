import { MobileNavBar, MobileNavBarTitle } from '@lobehub/ui';
import { Tag } from 'antd';
import { useRouter } from 'next/navigation';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { SettingsTabs } from '@/store/global/initialState';

interface HeaderProps {
  activeTab: SettingsTabs;
}

const Header = memo<HeaderProps>(({ activeTab }) => {
  const { t } = useTranslation('setting');

  const router = useRouter();

  return (
    <MobileNavBar
      center={
        <MobileNavBarTitle
          title={
            <Flexbox align={'center'} gap={4} horizontal>
              {t(`tab.${activeTab}`)}
              {activeTab === SettingsTabs.Sync && <Tag color={'gold'}>{t('tab.experiment')}</Tag>}
            </Flexbox>
          }
        />
      }
      onBackClick={() => router.push('/settings')}
      showBackButton
    />
  );
});

export default Header;
