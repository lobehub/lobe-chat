'use client';

import { RouterProvider } from 'react-router-dom';

import { createMobileRouter } from './mobileRouter.config';

const ClientRouter = () => {
  const router = createMobileRouter();
  return <RouterProvider router={router} />;
};

ClientRouter.displayName = 'ClientRouter';

export default ClientRouter;
