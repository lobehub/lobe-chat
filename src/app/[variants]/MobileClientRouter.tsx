'use client';

import { memo, useMemo } from 'react';
import { RouterProvider } from 'react-router-dom';

import type { Locales } from '@/types/locale';

import { createMobileRouter } from './mobileRouter.config';

interface ClientRouterProps {
  locale: Locales;
}

const ClientRouter = memo<ClientRouterProps>(({ locale }) => {
  const router = useMemo(() => createMobileRouter(locale), [locale]);
  return <RouterProvider router={router} />
});

ClientRouter.displayName = 'ClientRouter';

export default ClientRouter;
