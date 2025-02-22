import { Suspense } from 'react';

import Loading from '@/components/Loading/BrandTextLoading';

import AuthLoginPage from './AuthLoginPage';

export default () => (
  <Suspense fallback={<Loading />}>
    <AuthLoginPage />
  </Suspense>
);
