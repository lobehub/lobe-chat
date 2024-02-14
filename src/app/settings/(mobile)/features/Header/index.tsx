import { MobileNavBar, MobileNavBarTitle } from '@lobehub/ui';
import { useRouter } from 'next/navigation';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { SettingsTabs } from '@/store/global/initialState';

interface HeaderProps {
  activeTab: SettingsTabs;
}

const Header = memo<HeaderProps>(({ activeTab }) => {
  const { t } = useTranslation('setting');

  const router = useRouter();

  return (
    <MobileNavBar
      center={<MobileNavBarTitle title={t(`tab.${activeTab}`)} />}
      onBackClick={() => router.push('/settings')}
      showBackButton
    />
  );
});

export default Header;
