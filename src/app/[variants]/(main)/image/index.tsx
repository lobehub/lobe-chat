'use client';

import { Suspense, memo } from 'react';

import ImageWorkspace from './features/ImageWorkspace';
import SkeletonList from './features/ImageWorkspace/SkeletonList';

const DesktopImagePage = memo(() => {
  return (
    <Suspense fallback={<SkeletonList />}>
      <ImageWorkspace />
    </Suspense>
  );
});

DesktopImagePage.displayName = 'DesktopImagePage';

export default DesktopImagePage;
