'use client';

import { memo } from 'react';
import urlJoin from 'url-join';

import Menu from '@/components/Menu';
import { useActiveSettingsKey } from '@/hooks/useActiveTabKey';
import { useQueryRoute } from '@/hooks/useQueryRoute';

import { useCategory } from '../../hooks/useCategory';

const CategoryContent = memo(() => {
  const activeTab = useActiveSettingsKey();
  const cateItems = useCategory();
  const router = useQueryRoute();

  return (
    <Menu
      items={cateItems}
      onClick={({ key }) => {
        router.push(urlJoin('/settings', key));
      }}
      selectable
      selectedKeys={[activeTab]}
      variant={'compact'}
    />
  );
});

export default CategoryContent;
