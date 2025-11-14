'use client';

import { ChatHeader } from '@lobehub/ui/mobile';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { enableAuth } from '@/const/auth';
import { useQueryState } from '@/hooks/useQueryParam';
import { useShowMobileWorkspace } from '@/hooks/useShowMobileWorkspace';
import { SettingsTabs } from '@/store/global/initialState';
import { useSessionStore } from '@/store/session';
import { mobileHeaderSticky } from '@/styles/mobileHeader';
import { useNavigate } from 'react-router-dom';

const Header = memo(() => {
  const { t } = useTranslation('setting');
  const showMobileWorkspace = useShowMobileWorkspace();
  const navigate = useNavigate();
  const [activeSettingsKey, setActiveSettingsKey] = useQueryState('active');
  const [providerName, setProviderName] = useQueryState('provider');

  const isSessionActive = useSessionStore((s) => !!s.activeId);
  const isProvider = providerName ? true : false;

  const handleBackClick = () => {
    console.log('gobackclick', isSessionActive, showMobileWorkspace, activeSettingsKey, providerName);
    if (isSessionActive && showMobileWorkspace) {
      navigate('/chat');
    } else if (activeSettingsKey === 'provider' && providerName) {
      setProviderName(null);
      setActiveSettingsKey('provider');
      navigate(-1);
    } else {
      navigate(enableAuth ? '/me/settings' : '/me');
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
