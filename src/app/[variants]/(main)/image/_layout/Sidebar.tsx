import React, { Suspense, memo } from 'react';

import Menu from '@/app/[variants]/(main)/image/_layout/Menu';
import { NavPanelPortal } from '@/features/NavPanel';
import SideBarLayout from '@/features/NavPanel/SideBarLayout';

import Header from './Header';

const Sidebar = memo(() => {
  return (
    <NavPanelPortal navKey="image">
      <Suspense>
        <SideBarLayout body={<Menu />} header={<Header />} />
      </Suspense>
    </NavPanelPortal>
  );
});

Sidebar.displayName = 'ImageSidebar';

export default Sidebar;
