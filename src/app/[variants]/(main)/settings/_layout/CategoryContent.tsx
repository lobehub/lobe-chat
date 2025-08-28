'use client';

import { memo } from 'react';

import Menu from '@/components/Menu';
import { withSuspense } from '@/components/withSuspense';
import { useCategory } from '../hooks/useCategory';
import { SettingsTabs } from '@/store/global/initialState';

type CategoryContentProps = {
  onMenuSelect: (key: SettingsTabs)=>void
}

const CategoryContent = memo((props: CategoryContentProps) => {
  const cateItems = useCategory();

  const { onMenuSelect} = props

  return (
    <Menu
      compact
      items={cateItems}
      onClick={({ key }) => {onMenuSelect(key as SettingsTabs)}}
      selectable
    />
  );
});

export default withSuspense(CategoryContent);