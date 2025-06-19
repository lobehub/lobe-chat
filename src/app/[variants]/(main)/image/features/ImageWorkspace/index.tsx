'use client';

import dynamic from 'next/dynamic';

import SkeletonList from './SkeletonList';

const ImageWorkspaceContent = dynamic(() => import('./ImageWorkspaceContent'), {
  ssr: false,
  loading: () => <SkeletonList />,
});

const ImageWorkspace = () => {
  return <ImageWorkspaceContent />;
};

export default ImageWorkspace;
