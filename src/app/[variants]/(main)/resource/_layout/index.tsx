'use client';

import { memo } from 'react';
import { Outlet } from 'react-router-dom';

const ResourceLayout = memo(() => {
  return <Outlet />;
});

ResourceLayout.displayName = 'ResourceLayout';

export default ResourceLayout;
