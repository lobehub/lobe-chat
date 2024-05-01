'use client';

import { useRouter } from 'next/navigation';
import { memo } from 'react';
import urlJoin from 'url-join';

import Menu from '@/components/Menu';
import { useActiveSettingsKey } from '@/hooks/useActiveSettingsKey';

import { useCategory } from '../../hooks/useCategory';

const SettingList = memo(() => {
  const activeTab = useActiveSettingsKey();
  const { cateItems } = useCategory();

  const router = useRouter();

  return (
    <Menu
      items={cateItems}
      onClick={({ key }) => router.push(urlJoin('/settings', key))}
      selectable
      selectedKeys={[activeTab as any]}
      variant={'compact'}
    />
  );
});

export default SettingList;
