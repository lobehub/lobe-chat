import { Suspense } from 'react';

import Loading from '@/components/Loading/BrandTextLoading';

import AuthErrorPage from './AuthErrorPage';

export default () => (
  <Suspense fallback={<Loading />}>
    <AuthErrorPage />
  </Suspense>
);
