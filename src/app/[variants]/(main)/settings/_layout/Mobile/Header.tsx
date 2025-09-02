'use client';

import { Tag } from '@lobehub/ui';
import { ChatHeader } from '@lobehub/ui/mobile';
import { useSearchParams } from 'next/navigation';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { enableAuth } from '@/const/auth';
import { useProviderName } from '@/hooks/useProviderName';
import { useQueryRoute } from '@/hooks/useQueryRoute';
import { useShowMobileWorkspace } from '@/hooks/useShowMobileWorkspace';
import { SettingsTabs } from '@/store/global/initialState';
import { useSessionStore } from '@/store/session';
import { mobileHeaderSticky } from '@/styles/mobileHeader';

const Header = memo(() => {
  const { t } = useTranslation('setting');

  const router = useQueryRoute();
  const showMobileWorkspace = useShowMobileWorkspace();

  const searchParams = useSearchParams();

  const activeSettingsKey = searchParams.get('provider') as SettingsTabs;
  const isSessionActive = useSessionStore((s) => !!s.activeId);
  const isProvider = activeSettingsKey ? true : false;
  const providerName = useProviderName(activeSettingsKey || '');

  const handleBackClick = () => {
    if (isSessionActive && showMobileWorkspace) {
      router.push('/chat');
    } else {
      router.push(enableAuth ? '/me/settings' : '/me');
    }
  };

  return (
    <ChatHeader
      center={
        <ChatHeader.Title
          title={
            <Flexbox align={'center'} gap={8} horizontal>
              <span style={{ lineHeight: 1.2 }}>
                {isProvider ? providerName : t(`tab.${activeSettingsKey || 'provider'}`)}
              </span>
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
