'use client';

import { memo } from 'react';
import urlJoin from 'url-join';

import Menu from '@/components/Menu';
import { useActiveSettingsKey } from '@/hooks/useActiveTabKey';
import { useQuery } from '@/hooks/useQuery';
import { useQueryRoute } from '@/hooks/useQueryRoute';
import { SettingsTabs } from '@/store/global/initialState';

import { useCategory } from '../../hooks/useCategory';

const CategoryContent = memo<{ modal?: boolean }>(({ modal }) => {
  const activeTab = useActiveSettingsKey();
  const { tab = SettingsTabs.Common } = useQuery();
  const cateItems = useCategory();
  const router = useQueryRoute();

  return (
    <Menu
      items={cateItems}
      onClick={({ key }) => {
        if (modal) {
          router.replace('/settings/modal', { query: { tab: key } });
        } else {
          router.push(urlJoin('/settings', key));
        }
      }}
      selectable
      selectedKeys={[modal ? tab : (activeTab as any)]}
      variant={'compact'}
    />
  );
});

export default CategoryContent;
