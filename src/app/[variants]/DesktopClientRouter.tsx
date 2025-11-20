'use client';

import { RouterProvider } from 'react-router-dom';

import type { Locales } from '@/types/locale';

import { createDesktopRouter } from './desktopRouter.config';

interface ClientRouterProps {
  locale: Locales;
}

const ClientRouter = ({ locale }: ClientRouterProps) => {
  const router = createDesktopRouter(locale);
  return <RouterProvider router={router} />;
};

ClientRouter.displayName = 'ClientRouter';

export default ClientRouter;
