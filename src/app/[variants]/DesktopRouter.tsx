'use client';

import dynamic from 'next/dynamic';
import { memo, useMemo } from 'react';
import { RouterProvider } from 'react-router-dom';

import Loading from '@/components/Loading/BrandTextLoading';
import type { Locales } from '@/types/locale';

import { createDesktopRouter } from './desktopRouter.config';

interface ClientRouterProps {
  locale: Locales;
}

const ClientRouter = memo<ClientRouterProps>(({ locale }) => {
  const router = useMemo(() => createDesktopRouter(locale), [locale]);
  return <RouterProvider router={router} />;
});

ClientRouter.displayName = 'ClientRouter';

const DesktopRouterClient = dynamic(() => Promise.resolve(ClientRouter), {
  loading: () => <Loading />,
  ssr: false,
});
interface DesktopRouterProps {
  locale: Locales;
}

const DesktopRouter = ({ locale }: DesktopRouterProps) => {
  return <DesktopRouterClient locale={locale} />;
};

export default DesktopRouter;
