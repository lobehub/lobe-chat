'use client';

import dynamic from 'next/dynamic';

import Loading from '@/components/Loading/BrandTextLoading';

const MobileRouter = dynamic(() => import('./_MobileRouter'), {
  loading: () => <Loading />,
  ssr: false,
});

export default MobileRouter;
