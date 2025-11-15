'use client';

import dynamic from 'next/dynamic';
import { memo, useMemo } from 'react';
import { RouterProvider } from 'react-router-dom';

import Loading from '@/components/Loading/BrandTextLoading';
import type { Locales } from '@/types/locale';

import { createMobileRouter } from './mobileRouter.config';

interface ClientRouterProps {
  locale: Locales;
}

const ClientRouter = memo<ClientRouterProps>(({ locale }) => {
  const router = useMemo(() => createMobileRouter(locale), [locale]);

  return <RouterProvider router={router} />;
});

ClientRouter.displayName = 'ClientRouter';

const MobileRouterClient = dynamic(() => Promise.resolve(ClientRouter), {
  loading: () => <Loading />,
  ssr: false,
});
interface MobileRouterProps {
  locale: Locales;
}

const MobileRouter = ({ locale }: MobileRouterProps) => {
  return <MobileRouterClient locale={locale} />;
};

export default MobileRouter;
