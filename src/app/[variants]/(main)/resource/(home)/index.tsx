'use client';

import { memo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import ResourceManager from '@/features/ResourceManager';
import { documentSelectors, useFileStore } from '@/store/file';
import { FilesTabs } from '@/types/files';

import { useResourceManagerStore } from '../features/store';

const ResourceHomePage = memo(() => {
  const [searchParams] = useSearchParams();
  const [setMode, setCurrentViewItemId, setCategory, setLibraryId] = useResourceManagerStore(
    (s) => [s.setMode, s.setCurrentViewItemId, s.setCategory, s.setLibraryId],
  );

  const categoryParam = (searchParams.get('category') as FilesTabs) || FilesTabs.All;
  const fileId = searchParams.get('file');

  // Fetch file or document details to determine correct mode
  const useFetchKnowledgeItem = useFileStore((s) => s.useFetchKnowledgeItem);
  const { data: fileData } = useFetchKnowledgeItem(fileId || undefined);
  const documentData = useFileStore(documentSelectors.getDocumentById(fileId || undefined));

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

      // Check if it's a PDF file - check both file data and document data
      const isPDF =
        fileData?.fileType?.toLowerCase() === 'pdf' ||
        fileData?.fileType?.toLowerCase() === 'application/pdf' ||
        fileData?.name?.toLowerCase().endsWith('.pdf') ||
        documentData?.fileType?.toLowerCase() === 'pdf' ||
        documentData?.fileType?.toLowerCase() === 'application/pdf' ||
        documentData?.filename?.toLowerCase().endsWith('.pdf');

      // Determine mode based on file type
      if (isPDF) {
        // PDF files should always use editor mode for PDF viewer
        setMode('editor');
      } else if (fileId.startsWith('doc')) {
        setMode('page');
      } else {
        setMode('editor');
      }
    } else {
      // Reset to explorer mode when no file is selected
      setMode('explorer');
      setCurrentViewItemId(undefined);
    }
  }, [fileId, fileData, documentData, setCurrentViewItemId, setMode]);

  return <ResourceManager />;
});

ResourceHomePage.displayName = 'ResourceHomePage';

export default ResourceHomePage;
