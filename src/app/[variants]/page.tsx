'use client';

import dynamic from 'next/dynamic';

import Loading from '@/components/Loading/BrandTextLoading';

const AppRouter = dynamic(() => import('./AppRouter'), {
  loading: () => <Loading />,
  ssr: false,
});

export default function Page() {
  return <AppRouter />;
}
