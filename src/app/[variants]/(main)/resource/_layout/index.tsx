'use client';

import { memo } from 'react';
import { Outlet } from 'react-router-dom';

import { ResourceManagerProvider } from '../features/ResourceManagerProvider';

const ResourceLayout = memo(() => {
  return (
    <ResourceManagerProvider>
      <Outlet />
    </ResourceManagerProvider>
  );
});

ResourceLayout.displayName = 'ResourceLayout';

export default ResourceLayout;
