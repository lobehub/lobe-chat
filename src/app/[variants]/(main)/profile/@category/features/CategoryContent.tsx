'use client';

import { memo } from 'react';
import urlJoin from 'url-join';

import Menu from '@/components/Menu';
import { useActiveSettingsKey } from '@/hooks/useActiveTabKey';
import { useQueryRoute } from '@/hooks/useQueryRoute';
import { ProfileTabs } from '@/store/global/initialState';

import { useCategory } from '../../hooks/useCategory';

const CategoryContent = memo(() => {
  const activeTab = useActiveSettingsKey();
  const cateItems = useCategory();
  const router = useQueryRoute();

  return (
    <Menu
      items={cateItems}
      onClick={({ key }) => {
        const activeKey = key === ProfileTabs.Profile ? '/' : key;

        router.push(urlJoin('/profile', activeKey));
      }}
      selectable
      selectedKeys={[activeTab]}
      variant={'compact'}
    />
  );
});

export default CategoryContent;
