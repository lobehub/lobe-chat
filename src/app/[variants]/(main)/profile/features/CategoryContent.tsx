'use client';

import { memo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Menu from '@/components/Menu';
import { ProfileTabs } from '@/store/global/initialState';

import { useCategory } from '../hooks/useCategory';

const CategoryContent = memo(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = location.pathname.replace(/^\//, '') || 'profile';
  const cateItems = useCategory();

  return (
    <Menu
      compact
      items={cateItems}
      onClick={({ key }) => {
        const activeKey = key === ProfileTabs.Profile ? '/' : `/${key}`;
        navigate(activeKey);
      }}
      selectable
      selectedKeys={activeTab === '' ? ['profile'] : [activeTab]}
    />
  );
});

export default CategoryContent;
