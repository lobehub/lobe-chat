'use client';

import { RouterProvider } from 'react-router-dom';

import type { Locales } from '@/types/locale';

import { createMobileRouter } from './mobileRouter.config';

interface ClientRouterProps {
  locale: Locales;
}

const ClientRouter = ({ locale }: ClientRouterProps) => {
  const router = createMobileRouter(locale);
  return <RouterProvider router={router} />;
};

ClientRouter.displayName = 'ClientRouter';

export default ClientRouter;
