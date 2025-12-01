'use client';

import { memo } from 'react';

import { NavPanelPortal } from '@/features/NavPanel';
import SideBarLayout from '@/features/NavPanel/SideBarLayout';

import DocumentList from './DocumentList';
import Header from './Header';

const Sidebar = memo(() => {
  return (
    <NavPanelPortal navKey="page">
      <SideBarLayout body={<DocumentList />} header={<Header />} />
    </NavPanelPortal>
  );
});

Sidebar.displayName = 'PageSidebar';

export default Sidebar;
