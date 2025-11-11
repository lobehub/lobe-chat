'use client';

import { memo } from 'react';
import { RouterProvider } from 'react-router-dom';

import { mobileRouter } from './mobileRouter.config';

const MobileClientRouter = memo(() => {
  return <RouterProvider router={mobileRouter} />;
});

MobileClientRouter.displayName = 'MobileClientRouter';

export default MobileClientRouter;
