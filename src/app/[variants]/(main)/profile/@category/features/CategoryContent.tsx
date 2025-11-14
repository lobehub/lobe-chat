'use client';

import { memo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import urlJoin from 'url-join';

import Menu from '@/components/Menu';
import { ProfileTabs } from '@/store/global/initialState';

import { useCategory } from '../../hooks/useCategory';

const CategoryContent = memo(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = location.pathname.split('/').at(-1);
  const cateItems = useCategory();

  return (
    <Menu
      compact
      items={cateItems}
      onClick={({ key }) => {
        const activeKey = key === ProfileTabs.Profile ? '/' : key;
        navigate(urlJoin('/profile', activeKey));
      }}
      selectable
      selectedKeys={activeTab ? [activeTab] : []}
    />
  );
});

export default CategoryContent;
