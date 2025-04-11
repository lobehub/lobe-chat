'use client';

import { ChatHeader } from '@lobehub/ui/mobile';
import { useRouter } from 'next/navigation';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { mobileHeaderSticky } from '@/styles/mobileHeader';

const Header = memo(() => {
  const { t } = useTranslation('changelog');

  const router = useRouter();
  return (
    <ChatHeader
      center={
        <ChatHeader.Title
          title={
            <Flexbox align={'center'} gap={4} horizontal>
              {t('title')}
            </Flexbox>
          }
        />
      }
      onBackClick={() => router.back()}
      showBackButton
      style={mobileHeaderSticky}
    />
  );
});

export default Header;
