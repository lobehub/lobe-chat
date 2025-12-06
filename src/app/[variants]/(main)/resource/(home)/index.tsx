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

  const categoryParam = (searchParams.get('category') as FilesTabs) || FilesTabs.All;
  const fileId = searchParams.get('file');

  // Clear libraryId when on home route (only once on mount)
  useEffect(() => {
    setLibraryId(undefined);
  }, [setLibraryId]);

  // Sync category from URL
  useEffect(() => {
    setCategory(categoryParam);
  }, [categoryParam, setCategory]);

  // Sync file view mode from URL
  useEffect(() => {
    if (fileId) {
      setCurrentViewItemId(fileId);
      if (fileId.startsWith('doc')) {
        setMode('page');
      } else {
        setMode('editor');
      }
    } else {
      // Reset to explorer mode when no file is selected
      setMode('explorer');
      setCurrentViewItemId(undefined);
    }
  }, [fileId, setCurrentViewItemId, setMode]);

  return <ResourceManager />;
});

ResourceHomePage.displayName = 'ResourceHomePage';

export default ResourceHomePage;
