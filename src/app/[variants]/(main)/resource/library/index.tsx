'use client';

import { memo, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import Container from '@/app/[variants]/(main)/resource/library/features/Container';
import NProgress from '@/components/NProgress';
import ResourceManager from '@/features/ResourceManager';

import { useKnowledgeBaseItem } from '../features/hooks/useKnowledgeItem';
import { useResourceManagerStore } from '../features/store';

const MainContent = memo(() => {
  const { id: knowledgeBaseId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [setMode, setCurrentViewItemId, setLibraryId] = useResourceManagerStore((s) => [
    s.setMode,
    s.setCurrentViewItemId,
    s.setLibraryId,
  ]);

  const fileId = searchParams.get('file');

  // Load knowledge base data
  useKnowledgeBaseItem(knowledgeBaseId || '');

  // Set libraryId from URL params (only when knowledgeBaseId changes)
  useEffect(() => {
    setLibraryId(knowledgeBaseId);
  }, [knowledgeBaseId, setLibraryId]);

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

MainContent.displayName = 'LibraryMainContent';

const LibraryPage = memo(() => {
  return (
    <>
      <NProgress />
      <Container>
        <MainContent />
      </Container>
    </>
  );
});

LibraryPage.displayName = 'LibraryPage';

export default LibraryPage;
