'use client';

import { ChatHeader } from '@lobehub/ui/mobile';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useQueryRoute } from '@/hooks/useQueryRoute';
import { mobileHeaderSticky } from '@/styles/mobileHeader';

import HeaderContent from '../../features/HeaderContent';

const Header = memo(() => {
  const { t } = useTranslation('setting');
  const router = useQueryRoute();

  return (
    <ChatHeader
      center={<ChatHeader.Title title={t('header.session')} />}
      onBackClick={() => router.push('/chat')}
      right={<HeaderContent />}
      showBackButton
      style={mobileHeaderSticky}
    />
  );
});

export default Header;
