'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import SideBarHeaderLayout from '@/features/NavPanel/SideBarHeaderLayout';

import AddButton from './AddButton';
import Search from './Search';

const Header = memo(() => {
  const { t } = useTranslation('common');
  return (
    <>
      <SideBarHeaderLayout left={t('tab.pages')} right={<AddButton />} />
      <Flexbox paddingInline={4}>
        <Search />
      </Flexbox>
    </>
  );
});

export default Header;
