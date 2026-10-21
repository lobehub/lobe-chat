'use client';

import { AccordionRoot, Flexbox } from '@lobehub/ui';
import { memo } from 'react';

import { useActiveWorkspaceId } from '@/business/client/hooks/useActiveWorkspaceId';
import SideBarLayout from '@/features/NavPanel/SideBarLayout';

import SidebarBody from './Body';
import PageSection from './Body/PageSection';
import Header from './Header';

export enum GroupKey {
  Library = 'library',
  MyDocs = 'my-docs',
  Shared = 'shared-docs',
}

const DEFAULT_OPEN = [GroupKey.Library, GroupKey.MyDocs, GroupKey.Shared];

/**
 * Docs sidebar: the four sections in the header, then shortcuts — recent
 * libraries, the caller's own pages and (in a workspace) pages teammates shared.
 */
const ResourceSidebarContent = memo(() => {
  const workspaceId = useActiveWorkspaceId();

  return (
    <SideBarLayout
      header={<Header />}
      body={
        <Flexbox paddingBlock={8} paddingInline={4}>
          <AccordionRoot defaultValue={DEFAULT_OPEN} indicatorPlacement="inline" style={{ gap: 8 }}>
            <SidebarBody itemKey={GroupKey.Library} />
            <PageSection itemKey={GroupKey.MyDocs} scope={'mine'} />
            {workspaceId && <PageSection itemKey={GroupKey.Shared} scope={'shared'} />}
          </AccordionRoot>
        </Flexbox>
      }
    />
  );
});

ResourceSidebarContent.displayName = 'ResourceSidebarContent';

export default ResourceSidebarContent;
