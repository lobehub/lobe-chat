'use client';

import { MobileNavBar, MobileNavBarTitle } from '@lobehub/ui';
import { useRouter } from 'next/navigation';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useActiveProfileKey } from '@/hooks/useActiveTabKey';
import { mobileHeaderSticky } from '@/styles/mobileHeader';

import ShareButton from '../../stats/features/ShareButton';

const Header = memo(() => {
  const { t } = useTranslation('auth');

  const router = useRouter();
  const activeSettingsKey = useActiveProfileKey();
  const isStats = activeSettingsKey === 'stats';

  const handleBackClick = () => {
    router.push('/me/profile');
  };

  return (
    <MobileNavBar
      center={
        <MobileNavBarTitle
          title={
            <Flexbox align={'center'} gap={8} horizontal>
              <span style={{ lineHeight: 1.2 }}> {t(`tab.${activeSettingsKey}`)}</span>
            </Flexbox>
          }
        />
      }
      onBackClick={handleBackClick}
      right={isStats ? <ShareButton mobile /> : undefined}
      showBackButton
      style={mobileHeaderSticky}
    />
  );
});

export default Header;
