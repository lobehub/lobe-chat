'use client';

import dynamic from 'next/dynamic';
import { memo, useMemo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useResourceManagerStore } from '@/app/[variants]/(main)/resource/features/store';
import PageEditor from '@/features/PageEditor';

import Editor from './components/Editor';
import Explorer from './components/Explorer';
import UploadDock from './components/UploadDock';

const ChunkDrawer = dynamic(() => import('./components/ChunkDrawer'), { ssr: false });

export type ResouceManagerMode = 'editor' | 'explorer' | 'page';

/**
 * Manage resources. Can be from a certian library.
 *
 * Business component, no need be reusable.
 */
const ResourceManager = memo(() => {
  const [mode, currentViewItemId, libraryId, category, setMode, setCurrentViewItemId] =
    useResourceManagerStore((s) => [
      s.mode,
      s.currentViewItemId,
      s.libraryId,
      s.category,
      s.setMode,
      s.setCurrentViewItemId,
    ]);

  const MainContent = useMemo(() => {
    switch (mode) {
      case 'page': {
        return (
          <PageEditor
            knowledgeBaseId={libraryId}
            onBack={() => {
              setMode('explorer');
              setCurrentViewItemId(undefined);
            }}
            pageId={currentViewItemId}
          />
        );
      }
      case 'editor': {
        return <Editor />;
      }
      case 'explorer': {
        return <Explorer />;
      }
    }
  }, [mode, currentViewItemId, libraryId, category]);

  return (
    <>
      <Flexbox gap={12} height={'100%'}>
        {MainContent}
      </Flexbox>
      <UploadDock />
      <ChunkDrawer />
    </>
  );
});

export default ResourceManager;
