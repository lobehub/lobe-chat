'use client';

import { memo, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import Container from '@/app/[variants]/(main)/resource/(home)/features/Container';
import NProgress from '@/components/NProgress';
import ResourceManager from '@/features/ResourceManager';
import { FilesTabs } from '@/types/files';

import { useFileCategory } from '../features/hooks/useFileCategory';
import { useResourceManagerStore } from '../features/store';

const MainContent = memo(() => {
  const { id } = useParams<{ id: string }>();
  const [category] = useFileCategory();
  const [searchParams] = useSearchParams();
  const setMode = useResourceManagerStore((s) => s.setMode);
  const setCurrentViewItemId = useResourceManagerStore((s) => s.setCurrentViewItemId);

  // Sync URL query parameter with store on mount and when it changes
  useEffect(() => {
    const fileId = searchParams.get('file');
    if (fileId && !fileId.startsWith('doc')) {
      setCurrentViewItemId(fileId);
      setMode('file');
    }
  }, [searchParams, setCurrentViewItemId, setMode]);

  return <ResourceManager category={category} documentId={id} title={`${category as FilesTabs}`} />;
});

MainContent.displayName = 'HomeMainContent';

const ResourceHomePage = memo(() => {
  return (
    <>
      <NProgress />
      <Container>
        <MainContent />
      </Container>
    </>
  );
});

ResourceHomePage.displayName = 'ResourceHomePage';

export default ResourceHomePage;
