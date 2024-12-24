'use client';

import { memo } from 'react';
import urlJoin from 'url-join';

import Menu from '@/components/Menu';
import { useActiveSettingsKey } from '@/hooks/useActiveTabKey';
import { useQuery } from '@/hooks/useQuery';
import { useQueryRoute } from '@/hooks/useQueryRoute';
import { ProfileTabs, SettingsTabs } from '@/store/global/initialState';

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
        const activeKey = key === ProfileTabs.Profile ? '/' : key;
        if (modal) {
          router.replace('/profile/modal', { query: { tab: activeKey } });
        } else {
          router.push(urlJoin('/profile', activeKey));
        }
      }}
      selectable
      selectedKeys={[modal ? tab : (activeTab as any)]}
      variant={'compact'}
    />
  );
});

export default CategoryContent;
