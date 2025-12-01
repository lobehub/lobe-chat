'use client';

import { PropsWithChildren, memo } from 'react';
import { useTranslation } from 'react-i18next';

import SideBarHeaderLayout from '@/features/NavPanel/SideBarHeaderLayout';

const Header = memo<PropsWithChildren>(() => {
  const { t } = useTranslation('common');
  return <SideBarHeaderLayout left={t('tab.aiImage')} />;
});

export default Header;
