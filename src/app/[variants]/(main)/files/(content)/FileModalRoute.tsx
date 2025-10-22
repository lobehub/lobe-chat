'use client';

import { memo } from 'react';
import { useParams } from 'react-router-dom';

import FileDetail from './@modal/(.)[id]/FileDetail';
import FilePreview from './@modal/(.)[id]/FilePreview';
import FullscreenModal from './@modal/(.)[id]/FullscreenModal';

/**
 * FileModalRoute component
 * Renders the file preview modal when an ID is in the route
 * File data is fetched from the Zustand store by FilePreview and FileDetail components
 */
const FileModalRoute = memo(() => {
  const { id } = useParams<{ id: string }>();

  if (!id) return null;

  return (
    <FullscreenModal detail={<FileDetail id={id} />}>
      <FilePreview id={id} />
    </FullscreenModal>
  );
});

FileModalRoute.displayName = 'FileModalRoute';

export default FileModalRoute;
