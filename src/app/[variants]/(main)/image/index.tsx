'use client';

import { Suspense, memo } from 'react';

import { isServerMode } from '@/const/version';

import ImageWorkspace from './features/ImageWorkspace';
import SkeletonList from './features/ImageWorkspace/SkeletonList';
import NotSupportClient from './NotSupportClient';

const DesktopImagePage = memo(() => {
  if (!isServerMode) {
    return <NotSupportClient />;
  }

  return (
    <Suspense fallback={<SkeletonList />}>
      <ImageWorkspace />
    </Suspense>
  );
});

DesktopImagePage.displayName = 'DesktopImagePage';

export default DesktopImagePage;
