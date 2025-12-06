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
  const setMode = useResourceManagerStore((s) => s.setMode);
  const setCurrentViewItemId = useResourceManagerStore((s) => s.setCurrentViewItemId);

  // Load knowledge base data
  useKnowledgeBaseItem(knowledgeBaseId || '');

  // Sync URL query parameter with store on mount and when it changes
  useEffect(() => {
    const fileId = searchParams.get('file');
    if (fileId && !fileId.startsWith('doc')) {
      setCurrentViewItemId(fileId);
      setMode('editor');
    }
  }, [searchParams, setCurrentViewItemId, setMode]);

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
