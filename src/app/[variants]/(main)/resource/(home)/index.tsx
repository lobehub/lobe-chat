'use client';

import { memo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import ResourceManager from '@/features/ResourceManager';
import { FilesTabs } from '@/types/files';

import { useResourceManagerStore } from '../features/store';

const ResourceHomePage = memo(() => {
  const [searchParams] = useSearchParams();
  const [setMode, setCurrentViewItemId, setCategory, setLibraryId] = useResourceManagerStore(
    (s) => [s.setMode, s.setCurrentViewItemId, s.setCategory, s.setLibraryId],
  );

  // Sync URL query parameter with store on mount and when it changes
  useEffect(() => {
    // Clear libraryId when on home route
    setLibraryId(undefined);

    const categoryParam = (searchParams.get('category') as FilesTabs) || FilesTabs.All;
    setCategory(categoryParam);

    const fileId = searchParams.get('file');
    if (fileId && !fileId.startsWith('doc')) {
      setCurrentViewItemId(fileId);
      setMode('editor');
    } else {
      // Reset to explorer mode when no file is selected
      setMode('explorer');
      setCurrentViewItemId(undefined);
    }
  }, [searchParams, setCurrentViewItemId, setMode, setCategory, setLibraryId]);

  return <ResourceManager />;
});

ResourceHomePage.displayName = 'ResourceHomePage';

export default ResourceHomePage;
