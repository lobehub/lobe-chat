'use client';

import { RouterProvider } from 'react-router-dom';

import { createDesktopRouter } from './desktopRouter.config';

const ClientRouter = () => {
  const router = createDesktopRouter();
  return <RouterProvider router={router} />;
};

ClientRouter.displayName = 'ClientRouter';

export default ClientRouter;
