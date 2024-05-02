'use client';

import { MobileNavBar, MobileNavBarTitle } from '@lobehub/ui';
import { useRouter } from 'next/navigation';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { mobileHeaderSticky } from '@/styles/mobileHeader';

import HeaderContent from '../../features/HeaderContent';

const Header = memo(() => {
  const { t } = useTranslation('setting');
  const router = useRouter();

  return (
    <MobileNavBar
      center={<MobileNavBarTitle title={t('header.session')} />}
      onBackClick={() => router.back()}
      right={<HeaderContent />}
      showBackButton
      style={mobileHeaderSticky}
    />
  );
});

export default Header;
