'use client';

import { memo, useMemo } from 'react';
import { RouterProvider } from 'react-router-dom';

import type { Locales } from '@/types/locale';

import { createDesktopRouter } from './desktopRouter.config';

interface DesktopClientRouterProps {
  locale: Locales;
}

const DesktopClientRouter = memo<DesktopClientRouterProps>(({ locale }) => {
  const router = useMemo(() => createDesktopRouter(locale), [locale]);

  return <RouterProvider router={router} />;
});

DesktopClientRouter.displayName = 'DesktopClientRouter';

export default DesktopClientRouter;
