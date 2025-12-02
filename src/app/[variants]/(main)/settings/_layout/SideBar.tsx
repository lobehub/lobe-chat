'use client';

import React, { memo } from 'react';

import { NavPanelPortal } from '@/features/NavPanel';
import SideBarLayout from '@/features/NavPanel/SideBarLayout';

import CategoryContent from './CategoryContent';
import Header from './Header';

const SidebarLayout = memo(() => {
  return (
    <NavPanelPortal navKey="image">
      <SideBarLayout body={<CategoryContent />} header={<Header />} />
    </NavPanelPortal>
  );
});

export default SidebarLayout;
