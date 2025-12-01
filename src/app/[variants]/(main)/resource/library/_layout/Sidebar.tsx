'use client';

import { memo } from 'react';
import { useParams } from 'react-router-dom';

import { NavPanelPortal } from '@/features/NavPanel';
import SideBarHeaderLayout from '@/features/NavPanel/SideBarHeaderLayout';
import SideBarLayout from '@/features/NavPanel/SideBarLayout';
import FileTree from '@/features/ResourceManager/FileTree';

import { ResourceManagerProvider } from '../../features/ResourceManagerProvider';
import LibraryHead from './Header/LibraryHead';

const Sidebar = memo(() => {
  const { id } = useParams<{ id: string }>();

  return (
    <NavPanelPortal navKey="resourceLibrary">
      <ResourceManagerProvider>
        <SideBarLayout
          body={<FileTree knowledgeBaseId={id || ''} />}
          header={<SideBarHeaderLayout backTo={'/resource'} left={<LibraryHead id={id || ''} />} />}
        />
      </ResourceManagerProvider>
    </NavPanelPortal>
  );
});

Sidebar.displayName = 'LibrarySidebar';

export default Sidebar;
