'use client';

import dynamic from 'next/dynamic';

import Loading from '@/components/Loading/BrandTextLoading';
import type { Locales } from '@/types/locale';

const MobileRouterClient = dynamic(() => import('./MobileClientRouter'), {
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
