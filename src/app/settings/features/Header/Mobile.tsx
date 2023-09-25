import { MobileNavBar, MobileNavBarTitle } from '@lobehub/ui';
import { useRouter } from 'next/navigation';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

const Header = memo(() => {
  const { t } = useTranslation('setting');
  const router = useRouter();

  return (
    <MobileNavBar
      center={<MobileNavBarTitle title={t('header.global')} />}
      onBackClick={() => router.push('/chat')}
      showBackButton
    />
  );
});

export default Header;
