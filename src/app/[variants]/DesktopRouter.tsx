'use client';

import dynamic from 'next/dynamic';
import { memo, useMemo } from 'react';
import { RouterProvider } from 'react-router-dom';

import BootErrorBoundary from '@/components/BootErrorBoundary';
import type { Locales } from '@/types/locale';

import { createDesktopRouter } from './desktopRouter.config';

interface ClientRouterProps {
  locale: Locales;
}

const ClientRouter = memo<ClientRouterProps>(({ locale }) => {
  const router = useMemo(() => createDesktopRouter(locale), [locale]);
  return (
    <BootErrorBoundary fallback={<>BootErrorBoundary Loading</>}>
      <RouterProvider router={router} />
    </BootErrorBoundary>
  );
});

ClientRouter.displayName = 'ClientRouter';

const DesktopRouterClient = dynamic(() => Promise.resolve(ClientRouter), {
  loading: () => <>123DesktopRouterClient</>,
  ssr: false,
});
interface DesktopRouterProps {
  locale: Locales;
}

const DesktopRouter = ({ locale }: DesktopRouterProps) => {
  return <DesktopRouterClient locale={locale} />;
};

export default DesktopRouter;
