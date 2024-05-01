'use client';

import { useRouter } from 'next/navigation';
import { memo } from 'react';
import urlJoin from 'url-join';

import Menu from '@/components/Menu';
import { useActiveSettingsKey } from '@/hooks/useActiveSettingsKey';

import { useCategory } from '../../hooks/useCategory';

const CategoryContent = memo<{ modal?: boolean }>(({ modal }) => {
  const activeTab = useActiveSettingsKey();
  const cateItems = useCategory();

  const router = useRouter();

  return (
    <Menu
      items={cateItems}
      onClick={({ key }) => {
        const path = urlJoin('/settings', key);
        if (modal) {
          router.replace(path);
        } else {
          router.push(path);
        }
      }}
      selectable
      selectedKeys={[activeTab as any]}
      variant={'compact'}
    />
  );
});

export default CategoryContent;
