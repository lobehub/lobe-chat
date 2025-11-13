'use client';

import { memo, useMemo } from 'react';
import { RouterProvider } from 'react-router-dom';

import type { Locales } from '@/types/locale';

import { createMobileRouter } from './mobileRouter.config';

interface MobileClientRouterProps {
  locale: Locales;
}

const MobileClientRouter = memo<MobileClientRouterProps>(({ locale }) => {
  const router = useMemo(() => createMobileRouter(locale), [locale]);

  return <RouterProvider router={router} />;
});

MobileClientRouter.displayName = 'MobileClientRouter';

export default MobileClientRouter;
