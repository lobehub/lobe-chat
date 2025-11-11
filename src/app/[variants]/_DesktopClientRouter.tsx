'use client';

import { memo } from 'react';
import { RouterProvider } from 'react-router-dom';

import { desktopRouter } from './desktopRouter.config';

const DesktopClientRouter = memo(() => {
  return <RouterProvider router={desktopRouter}/>;
});

DesktopClientRouter.displayName = 'DesktopClientRouter';

export default DesktopClientRouter;
