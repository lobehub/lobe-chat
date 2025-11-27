'use client';

import { memo } from 'react';
import { Outlet } from 'react-router-dom';

import RegisterHotkeys from './RegisterHotkeys';

const ResourceLayout = memo(() => {
  return (
    <>
      <Outlet />
      <RegisterHotkeys />
    </>
  );
});

ResourceLayout.displayName = 'ResourceLayout';

export default ResourceLayout;
