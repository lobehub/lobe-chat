'use client';

import { MobileNavBar, MobileNavBarTitle } from '@lobehub/ui';
import { Tag } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { enableAuth } from '@/const/auth';
import { useActiveSettingsKey } from '@/hooks/useActiveSettingsKey';
import { SettingsTabs } from '@/store/global/initialState';
import { mobileHeaderSticky } from '@/styles/mobileHeader';

const Header = memo(() => {
  const { t } = useTranslation('setting');

  const router = useRouter();
  const searchParams = useSearchParams();
  const activeSettingsKey = useActiveSettingsKey();

  const handleBackClick = () => {
    if (searchParams.has('session') && searchParams.has('showMobileWorkspace')) {
      router.push(`/chat?${searchParams.toString()}`);
    } else {
      router.push(enableAuth ? '/me/settings' : '/me');
    }
  };

  return (
    <MobileNavBar
      center={
        <MobileNavBarTitle
          title={
            <Flexbox align={'center'} gap={8} horizontal>
              <span style={{ lineHeight: 1.2 }}> {t(`tab.${activeSettingsKey}`)}</span>
              {activeSettingsKey === SettingsTabs.Sync && (
                <Tag bordered={false} color={'warning'}>
                  {t('tab.experiment')}
                </Tag>
              )}
            </Flexbox>
          }
        />
      }
      onBackClick={handleBackClick}
      showBackButton
      style={mobileHeaderSticky}
    />
  );
});

export default Header;
