'use client';

import dynamic from 'next/dynamic';

import Loading from '@/components/Loading/BrandTextLoading';
import type { Locales } from '@/types/locale';

const DesktopRouterClient = dynamic(() => import('./DesktopClientRouter'), {
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
