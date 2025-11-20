'use client';

import { ChatHeader } from '@lobehub/ui/mobile';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { useNavigate } from 'react-router-dom';

import { useActiveProfileKey } from '@/hooks/useActiveTabKey';
import { mobileHeaderSticky } from '@/styles/mobileHeader';

import ShareButton from '../../stats/features/ShareButton';

const Header = memo(() => {
  const { t } = useTranslation('auth');

  const navigate = useNavigate();
  const activeSettingsKey = useActiveProfileKey();
  const isStats = activeSettingsKey === 'stats';

  const handleBackClick = () => {
    navigate('/me/profile');
  };

  return (
    <ChatHeader
      center={
        <ChatHeader.Title
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
