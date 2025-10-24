'use client';

import { memo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import FileDetail from './modal/FileDetail';
import FilePreview from './modal/FilePreview';
import FullscreenModal from './modal/FullscreenModal';

/**
 * FileModalRoute component
 * Renders the file preview modal when an ID is in the route
 * File data is fetched from the Zustand store by FilePreview and FileDetail components
 */
const FileModalRoute = memo(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleClose = useCallback(() => {
    navigate('/', { replace: true });
  }, [navigate]);

  if (!id) return null;

  return (
    <FullscreenModal detail={<FileDetail id={id} />} onClose={handleClose}>
      <FilePreview id={id} />
    </FullscreenModal>
  );
});

FileModalRoute.displayName = 'FileModalRoute';

export default FileModalRoute;
