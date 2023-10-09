import { MobileNavBar, MobileNavBarTitle } from '@lobehub/ui';
import { useRouter } from 'next/navigation';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useGlobalStore } from '@/store/global';

const Header = memo(() => {
  const { t } = useTranslation('setting');
  const tab = useGlobalStore((s) => s.settingsTab);

  const router = useRouter();

  return (
    <MobileNavBar
      center={<MobileNavBarTitle title={t(`tab.${tab}`)} />}
      onBackClick={() => router.back()}
      showBackButton
    />
  );
});

export default Header;
