'use client';

import { ChatHeader } from '@lobehub/ui/mobile';
import { useQueryState } from 'nuqs';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { enableAuth } from '@/const/auth';
import { useQueryRoute } from '@/hooks/useQueryRoute';
import { useShowMobileWorkspace } from '@/hooks/useShowMobileWorkspace';
import { SettingsTabs } from '@/store/global/initialState';
import { useSessionStore } from '@/store/session';
import { mobileHeaderSticky } from '@/styles/mobileHeader';

const Header = memo(() => {
  const { t } = useTranslation('setting');
  const router = useQueryRoute();
  const showMobileWorkspace = useShowMobileWorkspace();

  const [activeSettingsKey, setActiveSettingsKey] = useQueryState('active');
  const [providerName, setProviderName] = useQueryState('provider');

  const isSessionActive = useSessionStore((s) => !!s.activeId);
  const isProvider = providerName ? true : false;

  const handleBackClick = () => {
    if (isSessionActive && showMobileWorkspace) {
      router.push('/chat');
    } else if (activeSettingsKey === 'provider' && providerName !== null) {
      setProviderName(null);
      setActiveSettingsKey('provider');
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
                {isProvider ? providerName : t(`tab.${activeSettingsKey as SettingsTabs}`)}
              </span>
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
