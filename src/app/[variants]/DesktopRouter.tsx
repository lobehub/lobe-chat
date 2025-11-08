'use client';

import dynamic from 'next/dynamic';

import Loading from '@/components/Loading/BrandTextLoading';

const DesktopRouter = dynamic(() => import('./_DesktopRouter'), {
  loading: () => <Loading />,
  ssr: false,
});

export default DesktopRouter;
