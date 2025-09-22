'use client';

import { memo } from 'react';

import Menu from '@/components/Menu';
import { withSuspense } from '@/components/withSuspense';
import { SettingsTabs } from '@/store/global/initialState';

import { useCategory } from '../hooks/useCategory';

type CategoryContentProps = {
  activeTab: string | undefined;
  onMenuSelect: (key: SettingsTabs) => void;
};

const CategoryContent = memo((props: CategoryContentProps) => {
  const cateItems = useCategory();

  const { onMenuSelect, activeTab } = props;

  return (
    <Menu
      compact
      defaultSelectedKeys={[activeTab || SettingsTabs.Common]}
      items={cateItems}
      onClick={({ key }) => {
        onMenuSelect(key as SettingsTabs);
      }}
      selectable
    />
  );
});

export default withSuspense(CategoryContent);
