'use client';

import { memo } from 'react';
import { useParams } from 'react-router-dom';

import { NavPanelPortal } from '@/features/NavPanel';
import SideBarLayout from '@/features/NavPanel/SideBarLayout';
import FileTree from '@/features/ResourceManager/FileTree';

import Header from './Header';

const Sidebar = memo(() => {
  const { id } = useParams<{ id: string }>();
  return (
    <NavPanelPortal navKey="resourceLibrary">
      <SideBarLayout body={<FileTree knowledgeBaseId={id || ''} />} header={<Header />} />
    </NavPanelPortal>
  );
});

Sidebar.displayName = 'LibrarySidebar';

export default Sidebar;
