import { Suspense } from 'react';

import Loading from '@/components/Loading/BrandTextLoading';

import AuthSignInBox from './AuthSignInBox';

export default () => (
  <Suspense fallback={<Loading />}>
    <AuthSignInBox />
  </Suspense>
);
