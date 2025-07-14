import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { oidcEnv } from '@/envs/oidc';

import DesktopCallbackClient from './DesktopCallbackClient';
import DesktopCallbackLayout, { LoadingFallback } from './DesktopCallbackLayout';

const DesktopCallbackPage = async () => {
  if (!oidcEnv.ENABLE_OIDC) return notFound();

  return (
    <DesktopCallbackLayout>
      <Suspense fallback={<LoadingFallback />}>
        <DesktopCallbackClient />
      </Suspense>
    </DesktopCallbackLayout>
  );
};

export default DesktopCallbackPage;
